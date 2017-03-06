"""Definition of base classes for Clouds

This currently contains only BaseController. It includes basic functionality
for a given cloud (including libcloud calls, fetching and storing information
to db etc. Cloud specific controllers are in `mist.io.clouds.controllers`.

"""

import ssl
import json
import copy
import socket
import logging
import datetime
import calendar

import mongoengine as me

from libcloud.common.types import InvalidCredsError
from libcloud.compute.types import NodeState
from libcloud.compute.base import NodeLocation, Node

from mist.io import config

from mist.io.exceptions import MistError
from mist.io.exceptions import ConflictError
from mist.io.exceptions import ForbiddenError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import InternalServerError
from mist.io.exceptions import MachineNotFoundError
from mist.io.exceptions import CloudUnavailableError
from mist.io.exceptions import CloudUnauthorizedError

from mist.io.helpers import get_datetime

try:
    from mist.core.vpn.methods import destination_nat as dnat
    from mist.core.vpn.methods import super_ping
except ImportError:
    from mist.io.dummy.methods import dnat, super_ping

from mist.io.clouds.controllers.base import BaseController

from mist.io.tag.models import Tag

from mist.io.machines.models import Machine


log = logging.getLogger(__name__)


class BaseComputeController(BaseController):
    """Abstract base class for every cloud/provider controller

    This base controller factors out all the steps common to all or most
    clouds into a base class, and defines an interface for provider or
    technology specific cloud controllers.

    Subclasses are meant to extend or override methods of this base class to
    account for differences between different cloud types.

    Care should be taken when considering to add new methods to a subclass.
    All controllers should have the same interface, to the degree this is
    feasible. That is to say, don't add a new method to a subclass unless
    there is a very good reason to do so.

    The following convention is followed:

    Any methods and attributes that don't start with an underscore are the
    controller's public API.

    In the `BaseComputeController`, these public methods will in most cases
    contain a basic implementation that works for most clouds, along with the
    proper logging and error handling. In almost all cases, subclasses SHOULD
    NOT override or extend the public methods of `BaseComputeController`. To
    account for cloud/subclass specific behaviour, one is expected to override
    the internal/private methods of `BaseComputeController`.

    Any methods and attributes that start with an underscore are the
    controller's internal/private API.

    To account for cloud/subclass specific behaviour, the public methods of
    `BaseComputeController` call a number of private methods. These methods
    will always start with an underscore, such as `self._connect`. When an
    internal method is only ever used in the process of one public method, it
    is prefixed as such to make identification and purpose more obvious. For
    example, method `self._list_machines__postparse_machine` is called in the
    process of `self.list_machines` to postparse a machine and inject or modify
    its attributes.

    This `BaseComputeController` defines a strict interface to controlling
    clouds.  For each different cloud type, a subclass needs to be defined. The
    subclass must at least define a proper `self._connect` method. For simple
    clouds, this may be enough. To provide cloud specific processing, hook the
    code on the appropriate private method. Each method defined here documents
    its intended purpose and use.

    """

    def check_connection(self):
        """Raise exception if we can't connect to cloud provider

        In case of error, an instance of `CloudUnavailableError` or
        `CloudUnauthorizedError` should be raised.

        For most cloud providers, who use an HTTP API, calling `connect`
        doesn't really establish a connection, so we also have to attempt to
        make an actual call such as `list_machines` to verify that the
        connection actually works.

        If a subclass's `connect` not raising errors is enough to make sure
        that establishing a connection works, then these subclasses should
        override this method and only call `connect`.

        In most cases, subclasses SHOULD NOT override or extend this method.

        """
        super(BaseComputeController, self).check_connection()
        self.list_machines()

    def list_machines(self):
        """Return list of machines for cloud

        A list of nodes is fetched from libcloud, the data is processed, stored
        on machine models, and a list of machine models is returned.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_machines__fetch_machines`
            `self._list_machines__machine_actions`
            `self._list_machines__postparse_machine`
            `self._list_machines__cost_machine`
            `self._list_machines__fetch_generic_machines`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Try to query list of machines from provider API.
        try:
            nodes = self._list_machines__fetch_machines()
            log.info("List nodes returned %d results for %s.",
                     len(nodes), self.cloud)
        except InvalidCredsError as exc:
            log.warning("Invalid creds on running list_nodes on %s: %s",
                        self.cloud, exc)
            raise CloudUnauthorizedError()
        except ssl.SSLError as exc:
            log.error("SSLError on running list_nodes on %s: %s",
                      self.cloud, exc)
            raise CloudUnavailableError(exc=exc)
        except Exception as exc:
            log.exception("Error while running list_nodes on %s", self.cloud)
            raise CloudUnavailableError(exc=exc)

        machines = []
        now = datetime.datetime.utcnow()

        # Process each machine in returned list.
        # Store previously unseen machines separately.
        new_machines = []
        for node in nodes:

            # Fetch machine mongoengine model from db, or initialize one.
            try:
                machine = Machine.objects.get(cloud=self.cloud,
                                              machine_id=node.id)
            except Machine.DoesNotExist:
                machine = Machine(cloud=self.cloud, machine_id=node.id).save()
                new_machines.append(machine)

            # Update machine_model's last_seen fields.
            machine.last_seen = now
            machine.missing_since = None

            # Get misc libcloud metadata.
            image_id = str(node.image or node.extra.get('imageId') or
                           node.extra.get('image_id') or
                           node.extra.get('image') or '')
            size = (node.size or node.extra.get('flavorId')
                    or node.extra.get('instancetype'))

            machine.name = node.name
            machine.image_id = image_id
            machine.size = size
            machine.state = config.STATES[node.state]
            machine.private_ips = node.private_ips
            machine.public_ips = node.public_ips

            # Set machine extra dict.
            # Make sure we don't meet any surprises when we try to json encode
            # later on in the HTTP response.
            extra = self._list_machines__get_machine_extra(machine, node)

            for key, val in extra.items():
                try:
                    json.dumps(val)
                except TypeError:
                    extra[key] = str(val)
            machine.extra = extra

            # Set machine hostname
            if machine.extra.get('dns_name'):
                machine.hostname = machine.extra['dns_name']
            else:
                for ip in machine.public_ips + machine.private_ips:
                    if ':' not in ip:
                        machine.hostname = ip
                        break

            # Get machine tags from db
            tags = {tag.key: tag.value for tag in Tag.objects(
                owner=self.cloud.owner, resource=machine,
            ).only('key', 'value')}

            # Get machine creation date.
            try:
                created = self._list_machines__machine_creation_date(machine,
                                                                     node)
                if created:
                    machine.created = get_datetime(created)
            except Exception as exc:
                log.exception("Error finding creation date for %s in %s.",
                              self.cloud, machine)
            # TODO: Consider if we should fall back to using current date.
            # if not machine_model.created:
            #     machine_model.created = datetime.datetime.utcnow()

            # Update with available machine actions.
            try:
                self._list_machines__machine_actions(machine, node)
            except Exception as exc:
                log.exception("Error while finding machine actions "
                              "for machine %s:%s for %s",
                              machine.id, node.name, self.cloud)

            # Apply any cloud/provider specific post processing.
            try:
                self._list_machines__postparse_machine(machine, node)
            except Exception as exc:
                log.exception("Error while post parsing machine %s:%s for %s",
                              machine.id, node.name, self.cloud)

            # Apply any cloud/provider cost reporting.
            try:
                def parse_num(num):
                    try:
                        return float(num or 0)
                    except (ValueError, TypeError):
                        log.warning("Can't parse %r as float.", num)
                        return 0

                month_days = calendar.monthrange(now.year, now.month)[1]

                cph = parse_num(tags.get('cost_per_hour'))
                cpm = parse_num(tags.get('cost_per_month'))
                if not (cph or cpm) or cph > 100 or cpm > 100 * 24 * 31:
                    cph, cpm = map(parse_num,
                                   self._list_machines__cost_machine(machine,
                                                                     node))
                if not cph:
                    cph = float(cpm) / month_days / 24
                elif not cpm:
                    cpm = cph * 24 * month_days
                machine.cost.hourly = cph
                machine.cost.monthly = cpm

            except Exception as exc:
                log.exception("Error while calculating cost "
                              "for machine %s:%s for %s",
                              machine.id, node.name, self.cloud)
            if node.state.lower() == 'terminated':
                machine.cost.hourly = 0
                machine.cost.monthly = 0

            # Save all changes to machine model on the database.
            try:
                machine.save()
            except me.ValidationError as exc:
                log.error("Error adding %s: %s", machine.name, exc.to_dict())
                raise BadRequestError({"msg": exc.message,
                                       "errors": exc.to_dict()})
            except me.NotUniqueError as exc:
                log.error("Machine %s not unique error: %s", machine.name, exc)
                raise ConflictError("Machine with this name already exists")

            machines.append(machine)

        # Append generic-type machines, which aren't handled by libcloud.
        for machine in self._list_machines__fetch_generic_machines():
            machine.last_seen = now
            machine.missing_since = None
            machine.state = config.STATES[NodeState.UNKNOWN]
            for action in ('start', 'stop', 'reboot', 'destroy', 'rename',
                           'resume', 'suspend', 'undefine'):
                setattr(machine.actions, action, False)
            machine.actions.tag = True
            # allow reboot action for bare metal with key associated
            if machine.key_associations:
                machine.actions.reboot = True
            machine.save()
            machines.append(machine)

        # Set last_seen on machine models we didn't see for the first time now.
        Machine.objects(cloud=self.cloud,
                        id__nin=[m.id for m in machines],
                        missing_since=None).update(missing_since=now)

        # Update RBAC Mappings given the list of nodes seen for the first time.
        self.cloud.owner.mapper.update(new_machines)

        # Update machine counts on cloud and org.
        # FIXME: resolve circular import issues
        from mist.io.clouds.models import Cloud
        self.cloud.machine_count = len(machines)
        self.cloud.save()
        self.cloud.owner.total_machine_count = sum(
            cloud.machine_count for cloud in Cloud.objects(
                owner=self.cloud.owner, deleted=None
            ).only('machine_count')
        )
        self.cloud.owner.save()

        # Close libcloud connection
        try:
            self.disconnect()
        except Exception as exc:
            log.warning("Error while closing connection: %r", exc)

        return machines

    def _list_machines__fetch_machines(self):
        """Perform the actual libcloud call to get list of nodes"""
        return self.connection.list_nodes()

    def _list_machines__get_machine_extra(self, machine, machine_libcloud):
        """Return extra dict for libcloud node

        Subclasses can override/extend this method if they wish to filter or
        inject extra metadata.
        """
        return copy.copy(machine_libcloud.extra)

    def _list_machines__machine_creation_date(self, machine, machine_libcloud):
        return

    def _list_machines__machine_actions(self, machine, machine_libcloud):
        """Add metadata on the machine dict on the allowed actions

        Any subclass that wishes to specially handle its allowed actions, can
        implement this internal method.

        machine: A machine mongoengine model. The model may not have yet
            been saved in the database.
        machine_libcloud: An instance of a libcloud compute node, as
            returned by libcloud's list_nodes.
        This method is expected to edit `machine` in place and not return
        anything.

        Subclasses MAY extend this method.

        """
        # Defaults for running state and common clouds.
        machine.actions.start = False
        machine.actions.stop = True
        machine.actions.reboot = True
        machine.actions.destroy = True
        machine.actions.rename = False  # Most providers do not support this
        machine.actions.tag = True   # Always True now that we store tags in db

        # Actions resume, suspend and undefine are states related to KVM.
        machine.actions.resume = False
        machine.actions.suspend = False
        machine.actions.undefine = False

        # Default actions for other states.
        if machine_libcloud.state in (NodeState.REBOOTING, NodeState.PENDING):
            machine.actions.start = False
            machine.actions.stop = False
            machine.actions.reboot = False
        elif machine_libcloud.state in (NodeState.STOPPED, NodeState.UNKNOWN):
            # We assume unknown state means stopped.
            machine.actions.start = True
            machine.actions.stop = False
            machine.actions.reboot = False
        elif machine_libcloud.state in (NodeState.TERMINATED, ):
            machine.actions.start = False
            machine.actions.stop = False
            machine.actions.reboot = False
            machine.actions.destroy = False
            machine.actions.rename = False

    def _list_machines__postparse_machine(self, machine, machine_libcloud):
        """Post parse a machine before returning it in list_machines

        Any subclass that wishes to specially handle its cloud's tags and
        metadata, can implement this internal method.

        machine: A machine mongoengine model. The model may not have yet
            been saved in the database.
        machine_libcloud: An instance of a libcloud compute node,
            as returned by libcloud's list_nodes.

        This method is expected to edit its arguments in place and not return
        anything.

        Subclasses MAY override this method.

        """
        return

    def _list_machines__cost_machine(self, machine, machine_libcloud):
        """Perform cost calculations for a machine

        Any subclass that wishes to handle its cloud's pricing, can implement
        this internal method.

       machine: A machine mongoengine model. The model may not have yet
            been saved in the database.
       machine_libcloud: An instance of a libcloud compute node, as returned by
            libcloud's list_nodes.

       This method is expected to return a tuple of two values:
            (cost_per_hour, cost_per_month)

        Subclasses MAY override this method.

        """
        return 0, 0

    def _list_machines__fetch_generic_machines(self):
        """Return list of machine models that aren't handled by libcloud"""
        return []

    def check_if_machine_accessible(self, machine):
        """Attempt to port knock and ping the machine"""
        assert machine.cloud.id == self.cloud.id
        hostname = machine.hostname or (
            machine.private_ips[0] if machine.private_ips else '')
        if not hostname:
            return False
        ports_list = [22, 80, 443, 3389]
        for port in (machine.ssh_port, machine.rdp_port):
            if port and port not in ports_list:
                ports_list.insert(0, port)
        socket_timeout = 3
        # add timeout for socket
        for port in ports_list:
            log.info("Attempting to connect to %s:%d", hostname, port)
            try:
                s = socket.create_connection(
                    dnat(self.cloud.owner, hostname, port),
                    socket_timeout
                )
                s.shutdown(2)
            except:
                log.info("Failed to connect to %s:%d", hostname, port)
                continue
            log.info("Connected to %s:%d", hostname, port)
            return True
        try:
            log.info("Pinging %s", hostname)
            ping = super_ping(owner=self.cloud.owner,
                              host=hostname, pkts=1)
            if int(ping.get('packets_rx', 0)) > 0:
                log.info("Successfully pinged %s", hostname)
                return True
        except:
            log.info("Failed to ping %s", hostname)
            pass
        return False

    def list_images(self, search=None):
        """Return list of images for cloud

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_images__fetch_images`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Fetch images list, usually from libcloud connection.
        images = self._list_images__fetch_images(search=search)
        if not isinstance(images, list):
            images = list(images)

        # Filter out duplicate images, if any.
        seen_ids = set()
        for i in reversed(xrange(len(images))):
            image = images[i]
            if image.id in seen_ids:
                images.pop(i)
            else:
                seen_ids.add(image.id)

        # Filter images based on search term.
        if search:
            search = str(search).lower()
            images = [img for img in images
                      if search in img.id.lower()
                      or search in img.name.lower()]

        # Filter out invalid images.
        images = [img for img in images
                  if img.name and img.id[:3] not in ('aki', 'ari')
                  and 'windows' not in img.name.lower()]

        # Turn images to dict to return and star them.
        images = [{'id': img.id,
                   'name': img.name,
                   'extra': img.extra,
                   'star': self.image_is_starred(img.id)}
                  for img in images]

        # Sort images: Starred first, then alphabetically.
        images.sort(key=lambda image: (not image['star'], image['name']))

        return images

    def _list_images__fetch_images(self, search=None):
        """Fetch image listing in a libcloud compatible format

        This is to be called exclusively by `self.list_images`.

        Most subclasses that use a simple libcloud connection, shouldn't need
        to override or extend this method.

        Subclasses MAY override this method.

        """
        return self.connection.list_images()

    def image_is_starred(self, image_id):
        starred = image_id in self.cloud.starred
        unstarred = image_id in self.cloud.unstarred
        default = self.image_is_default(image_id)
        return starred or (default and not unstarred)

    def image_is_default(self, image_id):
        return True

    def list_sizes(self):
        """Return list of sizes for cloud

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_sizes__fetch_sizes`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Fetch sizes, usually from libcloud connection.
        sizes = self._list_sizes__fetch_sizes()

        # Format size information.
        return [{'id': size.id,
                 'name': size.name,
                 'bandwidth': size.bandwidth,
                 'disk': size.disk,
                 'driver': size.driver.name,
                 'price': size.price,
                 'ram': size.ram,
                 'extra': size.extra} for size in sizes]

    def _list_sizes__fetch_sizes(self):
        """Fetch size listing in a libcloud compatible format

        This is to be called exclusively by `self.list_sizes`.

        Most subclasses that use a simple libcloud connection, shouldn't need
        to override or extend this method.

        Subclasses MAY override this method.

        """
        return self.connection.list_sizes()

    def list_locations(self):
        """Return list of available locations for current cloud

        Locations mean different things in each cloud. e.g. EC2 uses it as a
        datacenter in a given availability zone, whereas Linode lists
        availability zones. However all responses share id, name and country
        eventhough in some cases might be empty, e.g. Openstack.

        This returns the results obtained from libcloud, after some processing,
        formatting and injection of extra information in a sane format.

        Subclasses SHOULD NOT override or extend this method.

        There are instead a number of methods that are called from this method,
        to allow subclasses to modify the data according to the specific of
        their cloud type. These methods currently are:

            `self._list_locations__fetch_locations`

        Subclasses that require special handling should override these, by
        default, dummy methods.

        """

        # Fetch locations, usually from libcloud connection.
        locations = self._list_locations__fetch_locations()

        # Format size information.
        return [{'id': location.id,
                 'name': location.name,
                 'country': location.country} for location in locations]

    def _list_locations__fetch_locations(self):
        """Fetch location listing in a libcloud compatible format

        This is to be called exclusively by `self.list_locations`.

        Most subclasses that use a simple libcloud connection, shouldn't need
        to override or extend this method.

        Subclasses MAY override this method.

        """
        try:
            return self.connection.list_locations()
        except:
            return [NodeLocation('', name='default', country='',
                                 driver=self.connection)]

    def _get_machine_libcloud(self, machine, no_fail=False):
        """Return an instance of a libcloud node

        This is a private method, used mainly by machine action methods.
        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        for node in self.connection.list_nodes():
            if node.id == machine.machine_id:
                return node
        if no_fail:
            return Node(machine.machine_id, name=machine.machine_id,
                        state=0, public_ips=[], private_ips=[],
                        driver=self.connection)
        raise MachineNotFoundError(
            "Machine with machine_id '%s'." % machine.machine_id
        )

    def start_machine(self, machine):
        """Start machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to start a machine would be to run

            machine.ctl.start()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are started, it should override `_start_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.start:
            raise ForbiddenError("Machine doesn't support start.")
        log.debug("Starting machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._start_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not start machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _start_machine(self, machine, machine_libcloud):
        """Private method to start a given machine

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `start_machine`.
        """
        self.connection.ex_start_node(machine_libcloud)

    def stop_machine(self, machine):
        """Stop machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to stop a machine would be to run

            machine.ctl.stop()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are stoped, it should override `_stop_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.stop:
            raise ForbiddenError("Machine doesn't support stop.")
        log.debug("Stopping machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._stop_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not stop machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _stop_machine(self, machine, machine_libcloud):
        """Private method to stop a given machine

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `stop_machine`.
        """
        self.connection.ex_stop_node(machine_libcloud)
        return True

    def reboot_machine(self, machine):
        """Reboot machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to reboot a machine would be to run

            machine.ctl.reboot()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are rebooted, it should override `_reboot_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.reboot:
            raise ForbiddenError("Machine doesn't support reboot.")
        log.debug("Rebooting machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._reboot_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not reboot machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _reboot_machine(self, machine, machine_libcloud):
        """Private method to reboot a given machine

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `reboot_machine`.
        """
        machine_libcloud.reboot()

    def reboot_machine_ssh(self, machine):
        """Reboot machine by running command over SSH"""
        assert self.cloud == machine.cloud
        log.debug("Rebooting (SSH) machine %s", machine)
        try:
            if machine.public_ips:
                hostname = machine.public_ips[0]
            else:
                hostname = machine.private_ips[0]
            command = '$(command -v sudo) shutdown -r now'
            # TODO move it up
            from mist.core.methods import ssh_command
            ssh_command(self.cloud.owner, self.cloud.id,
                        machine.machine_id, hostname, command)
        except MistError as exc:
            log.error("Could not reboot machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def destroy_machine(self, machine):
        """Destroy machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to destroy a machine would be to run

            machine.ctl.destroy()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are destroyed, it should override `_destroy_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.destroy:
            raise ForbiddenError("Machine doesn't support destroy.")
        log.debug("Destroying machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._destroy_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not destroy machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

        while machine.key_associations:
            machine.key_associations.pop()
        machine.state = 'terminated'
        machine.save()

    def _destroy_machine(self, machine, machine_libcloud):
        """Private method to destroy a given machine

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `destroy_machine`.
        """
        machine_libcloud.destroy()

    # It isn't implemented in the ui
    def resize_machine(self, machine, plan_id):
        """Resize machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to resize a machine would be to run

            machine.ctl.resize(plan_id)

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are resizeed, it should override `_resize_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.resize:
            raise ForbiddenError("Machine doesn't support resize.")
        log.debug("Resizing machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._resize_machine(machine, machine_libcloud, plan_id)
        except MistError as exc:
            log.error("Could not resize machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _resize_machine(self, machine, machine_libcloud, plan_id):
        """Private method to resize a given machine

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `resize_machine`.
        """
        self.connection.ex_resize_node(machine_libcloud, plan_id)

    def rename_machine(self, machine, name):
        """Rename machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to rename a machine would be to run

            machine.ctl.rename(name)

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are renameed, it should override `_rename_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.rename:
            raise ForbiddenError("Machine doesn't support rename.")
        log.debug("Renaming machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._rename_machine(machine, machine_libcloud, name)
        except MistError as exc:
            log.error("Could not rename machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _rename_machine(self, machine, machine_libcloud, name):
        """Private method to rename a given machine

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `rename_machine`.
        """
        self.connection.ex_rename_node(machine_libcloud, name)

    def resume_machine(self, machine):
        """Resume machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to resume a machine would be to run

            machine.ctl.resume()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are resumed, it should override `_resume_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.resume:
            raise ForbiddenError("Machine doesn't support resume.")
        log.debug("Resuming machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._resume_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not resume machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _resume_machine(self, machine, machine_libcloud):
        """Private method to resume a given machine

        Only LibvirtComputeController subclass implements this method.

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `resume_machine`.
        """
        raise NotImplementedError()

    def suspend_machine(self, machine):
        """Suspend machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to suspend a machine would be to run

            machine.ctl.suspend()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are suspended, it should override `_suspend_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.suspend:
            raise ForbiddenError("Machine doesn't support suspend.")
        log.debug("Suspending machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._suspend_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not suspend machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _suspend_machine(self, machine, machine_libcloud):
        """Private method to suspend a given machine

        Only LibvirtComputeController subclass implements this method.

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `suspend_machine`.
        """
        raise NotImplementedError()

    def undefine_machine(self, machine):
        """Undefine machine

        The param `machine` must be an instance of a machine model of this
        cloud.

        Not that the usual way to undefine a machine would be to run

            machine.ctl.undefine()

        which would in turn call this method, so that its cloud can customize
        it as needed.

        If a subclass of this controller wishes to override the way machines
        are undefineed, it should override `_undefine_machine` method instead.

        """
        # assert isinstance(machine.cloud, Machine)
        assert self.cloud == machine.cloud
        if not machine.actions.undefine:
            raise ForbiddenError("Machine doesn't support undefine.")
        log.debug("Undefining machine %s", machine)

        machine_libcloud = self._get_machine_libcloud(machine)
        try:
            self._undefine_machine(machine, machine_libcloud)
        except MistError as exc:
            log.error("Could not undefine machine %s", machine)
            raise
        except Exception as exc:
            log.exception(exc)
            raise InternalServerError(exc=exc)

    def _undefine_machine(self, machine, machine_libcloud):
        """Private method to undefine a given machine

        Only LibvirtComputeController subclass implements this method.

        Params:
            machine: instance of machine model of this cloud
            machine_libcloud: instance of corresponding libcloud node

        Differnent cloud controllers should override this private method, which
        is called by the public method `undefine_machine`.
        """
        raise NotImplementedError()
