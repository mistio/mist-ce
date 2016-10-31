"""Cloud Controllers

A cloud controller handles all operations that can be performed on a cloud,
commonly using libcloud under the hood.

It also performs several steps and combines the information stored in the
database with that returned from API calls to providers.

For each different cloud type, there is a corresponding cloud controller
defined here. All the different classes inherit BaseController and share a
commmon interface, with the exception that some controllers may not have
implemented all methods.

A cloud controller is initialized given a cloud. Most of the time it will be
accessed through a cloud model, using the `ctl` abbreviation, like this:

    cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
    print cloud.ctl.compute.list_machines()

"""


import uuid
import json
import socket
import logging

import mongoengine as me

from libcloud.utils.networking import is_private_subnet

from mist.io.exceptions import MistError
from mist.io.exceptions import NotFoundError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudExistsError
from mist.io.exceptions import CloudUnauthorizedError
from mist.io.exceptions import ServiceUnavailableError
from mist.io.exceptions import MachineUnauthorizedError
from mist.io.exceptions import RequiredParameterMissingError

from mist.io.helpers import sanitize_host, check_host

from mist.core.keypair.models import Keypair
from mist.core.vpn.methods import to_tunnel

from mist.io.clouds.main.base import BaseController
from mist.io.clouds.utils import rename_kwargs
from mist.io.clouds.compute import controllers as compute_controllers


log = logging.getLogger(__name__)


class AmazonController(BaseController):

    provider = 'ec2'
    ComputeController = compute_controllers.AmazonComputeController

    def _add__preparse_kwargs(self, kwargs):
        # Autofill apisecret from other Amazon Cloud.
        apikey = kwargs.get('apikey')
        apisecret = kwargs.get('apisecret')
        if apikey and apisecret == 'getsecretfromdb':
            cloud = type(self.cloud).objects(owner=self.cloud.owner,
                                             apikey=apikey).first()
            if cloud is not None:
                kwargs['apisecret'] = cloud.apisecret

    def _update__preparse_kwargs(self, kwargs):
        # Regions translations, eg ec2_ap_northeast to ap-northeast-1.
        region = kwargs.get('region', self.cloud.region)
        if region.startswith('ec2_'):
            region = region[4:]
            parts = region.split('_')
            if parts[-1] == 'oregon':
                parts[-1] = '2'
            if not parts[-1].isdigit():
                parts.append('1')
            kwargs['region'] = '-'.join(parts)


class DigitalOceanController(BaseController):

    provider = 'digitalocean'
    ComputeController = compute_controllers.DigitalOceanComputeController


class LinodeController(BaseController):

    provider = 'linode'
    ComputeController = compute_controllers.LinodeComputeController


class RackSpaceController(BaseController):

    provider = 'rackspace'
    ComputeController = compute_controllers.RackSpaceComputeController

    def _add__preparse_kwargs(self, kwargs):
        username = kwargs.get('username')
        apikey = kwargs.get('apikey')
        if apikey == 'getsecretfromdb':
            cloud = type(self.cloud).objects(owner=self.cloud.owner,
                                             username=username).first()
            if cloud is not None:
                kwargs['apikey'] = cloud.apikey


class SoftLayerController(BaseController):

    provider = 'softlayer'
    ComputeController = compute_controllers.SoftLayerComputeController


class NephoScaleController(BaseController):

    provider = 'nephoscale'
    ComputeController = compute_controllers.NephoScaleComputeController


class AzureController(BaseController):

    provider = 'azure'
    ComputeController = compute_controllers.AzureComputeController


class AzureArmController(BaseController):

    provider = 'azure_arm'
    ComputeController = compute_controllers.AzureArmComputeController


class GoogleController(BaseController):

    provider = 'gce'
    ComputeController = compute_controllers.GoogleComputeController

    def _update__preparse_kwargs(self, kwargs):
        private_key = kwargs.get('private_key', self.cloud.private_key)
        email = kwargs.get('email', self.cloud.email)
        if not email:
            # Support both ways to authenticate a service account,
            # by either using a project id and json key file (highly
            # recommended) and also by specifying email, project id and private
            # key file.
            try:
                creds = json.loads(private_key)
                kwargs['email'] = creds['client_email']
                kwargs['private_key'] = creds['private_key']
            except:
                raise MistError("Specify both 'email' and 'private_key' "
                                "params, or 'private_key' as a json file.")


class HostVirtualController(BaseController):

    provider = 'hostvirtual'
    ComputeController = compute_controllers.HostVirtualComputeController


class PacketController(BaseController):

    provider = 'packet'
    ComputeController = compute_controllers.PacketComputeController


class VultrController(BaseController):

    provider = 'vultr'
    ComputeController = compute_controllers.VultrComputeController


class VSphereController(BaseController):

    provider = 'vsphere'
    ComputeController = compute_controllers.VSphereComputeController

    def _update__preparse_kwargs(self, kwargs):
        host = kwargs.get('host', self.cloud.host)
        if host:
            kwargs['host'] = sanitize_host(host)
            check_host(kwargs['host'])


class VCloudController(BaseController):

    provider = 'vcloud'
    ComputeController = compute_controllers.VCloudComputeController

    def _update__preparse_kwargs(self, kwargs):
        username = kwargs.get('username', self.cloud.username) or ''
        organization = kwargs.pop('organization')
        if not organization:
            if '@' not in username:
                raise RequiredParameterMissingError('organization')
        else:
            if '@' in username:
                username = username.split('@')[0]
            kwargs['username'] = '%s@%s' % (username, organization)
        host = kwargs.get('host', self.cloud.host)
        if host:
            kwargs['host'] = sanitize_host(host)
            check_host(kwargs['host'])


class IndonesianVCloudController(VCloudController):

    provider = 'indonesian_vcloud'
    ComputeController = compute_controllers.VCloudComputeController

    def _update__preparse_kwargs(self, kwargs):
        host = kwargs.get('host', self.cloud.host) or 'my.idcloudonline.com'
        if host not in ('my.idcloudonline.com', 'compute.idcloudonline.com'):
            raise me.ValidationError("Invalid host '%s'." % host)
        super(IndonesianVCloudController,
              self)._update__preparse_kwargs(kwargs)


class OpenStackController(BaseController):

    provider = 'openstack'
    ComputeController = compute_controllers.OpenStackComputeController

    def _update__preparse_kwargs(self, kwargs):
        rename_kwargs(kwargs, 'auth_url', 'url')
        rename_kwargs(kwargs, 'tenant_name', 'tenant')
        url = kwargs.get('url', self.cloud.url)
        if url:
            if url.endswith('/v2.0/'):
                url = url.split('/v2.0/')[0]
            elif url.endswith('/v2.0'):
                url = url.split('/v2.0')[0]
            kwargs['url'] = url.rstrip('/')
            check_host(sanitize_host(kwargs['url']))


class DockerController(BaseController):

    provider = 'docker'
    ComputeController = compute_controllers.DockerComputeController

    def _update__preparse_kwargs(self, kwargs):
        rename_kwargs(kwargs, 'docker_port', 'port')
        rename_kwargs(kwargs, 'docker_host', 'host')
        rename_kwargs(kwargs, 'auth_user', 'username')
        rename_kwargs(kwargs, 'auth_password', 'password')
        host = kwargs.get('host', self.cloud.host)
        if host:
            kwargs['host'] = sanitize_host(host)
            check_host(kwargs['host'])


class LibvirtController(BaseController):

    provider = 'libvirt'
    ComputeController = compute_controllers.LibvirtComputeController

    def _add__preparse_kwargs(self, kwargs):
        rename_kwargs(kwargs, 'machine_hostname', 'host')
        rename_kwargs(kwargs, 'machine_user', 'username')
        rename_kwargs(kwargs, 'machine_key', 'key')
        rename_kwargs(kwargs, 'ssh_port', 'port')
        if kwargs.get('host'):
            kwargs['host'] = sanitize_host(kwargs['host'])
            check_host(kwargs['host'])
        if kwargs.get('key'):
            try:
                kwargs['key'] = Keypair.objects.get(owner=self.cloud.owner,
                                                    id=kwargs['key'])
            except Keypair.DoesNotExist:
                raise NotFoundError("Keypair does not exist.")

    def add(self, fail_on_error=True, fail_on_invalid_params=True, **kwargs):
        """This is a hack to associate a key with the VM hosting this cloud"""
        super(LibvirtController, self).add(
            fail_on_error=fail_on_error,
            fail_on_invalid_params=fail_on_invalid_params,
            **kwargs
        )
        if self.cloud.key is not None:
            # FIXME
            from mist.io.methods import associate_key
            associate_key(self.cloud.owner, self.cloud.key.id, self.cloud.id,
                          self.cloud.host,  # hypervisor id is the hostname
                          username=self.cloud.username, port=self.cloud.port)

    def update(self, fail_on_error=True, fail_on_invalid_params=True,
               **kwargs):
        # FIXME: Add update support, need to clean up kvm 'host' from libcloud,
        # and especially stop using cloud.host as the machine id ffs.
        raise BadRequestError("Update action is not currently support for "
                              "Libvirt/KVM clouds.")


class OtherController(BaseController):

    provider = 'bare_metal'
    ComputeController = compute_controllers.OtherComputeController

    def add(self, fail_on_error=True, fail_on_invalid_params=True, **kwargs):
        """Add new Cloud to the database

        This is the only cloud controller subclass that overrides the `add`
        method of `BaseController`.

        This is only expected to be called by `Cloud.add` classmethod to create
        a cloud. Fields `owner` and `title` are already populated in
        `self.cloud`. The `self.cloud` model is not yet saved.

        If appropriate kwargs are passed, this can currently also act as a
        shortcut to also add the first machine on this dummy cloud.

        """
        # Attempt to save.
        try:
            self.cloud.save()
        except me.ValidationError as exc:
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError:
            raise CloudExistsError("Cloud with name %s already exists"
                                   % self.cloud.title)

        # Add machine.
        if kwargs:
            try:
                self.add_machine_wrapper(
                    self.cloud.title, fail_on_error=fail_on_error,
                    fail_on_invalid_params=fail_on_invalid_params, **kwargs
                )
            except Exception as exc:
                if fail_on_error:
                    self.cloud.delete()
                raise

    def update(self, fail_on_error=True, fail_on_invalid_params=True,
               **kwargs):
        raise BadRequestError("OtherServer clouds don't support `update`. "
                              "Only title can be changed, using `rename`. "
                              "To change machine details, one must edit the "
                              "machines themselves, not the cloud.")

    def add_machine_wrapper(self, name, fail_on_error=True,
                            fail_on_invalid_params=True, **kwargs):
        """Wrapper around add_machine for kwargs backwards compatibity

        FIXME: This wrapper should be deprecated

        """
        # Sanitize params.
        rename_kwargs(kwargs, 'machine_ip', 'host')
        rename_kwargs(kwargs, 'machine_user', 'ssh_user')
        rename_kwargs(kwargs, 'machine_key', 'ssh_key')
        rename_kwargs(kwargs, 'machine_port', 'ssh_port')
        rename_kwargs(kwargs, 'remote_desktop_port', 'rdp_port')
        if kwargs.pop('windows', False):
            kwargs['os_type'] = 'windows'
        else:
            kwargs['os_type'] = 'unix'
        errors = {}
        for key in kwargs.keys():
            if key not in ('host', 'ssh_user', 'ssh_port', 'ssh_key',
                           'os_type', 'rdp_port'):
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        if errors:
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })

        # Add machine.
        return self.add_machine(name, fail_on_error=fail_on_error,
                                **kwargs)

    def add_machine(self, name, host='',
                    ssh_user='root', ssh_port=22, ssh_key=None,
                    os_type='unix', rdp_port=3389, fail_on_error=True):
        """Add machine to this dummy Cloud

        This is a special method that exists only on this Cloud subclass.

        """
        # FIXME: Move this to top of the file once Machine model is migrated.
        # The import statement is currently here to avoid circular import
        # issues.
        from mist.io.machines.models import Machine
        # FIXME: Move ssh command to Machine controller once it is migrated.
        from mist.core.methods import ssh_command

        # Sanitize inputs.
        host = sanitize_host(host)
        check_host(host)
        try:
            ssh_port = int(ssh_port)
        except (ValueError, TypeError):
            ssh_port = 22
        try:
            rdp_port = int(rdp_port)
        except (ValueError, TypeError):
            rdp_port = 3389
        if ssh_key:
            ssh_key = Keypair.objects.get(owner=self.cloud.owner, id=ssh_key)

        # Create and save machine entry to database.
        machine = Machine(
            cloud=self.cloud,
            name=name,
            machine_id=uuid.uuid4().hex,
            os_type=os_type,
            ssh_port=ssh_port,
            rdp_port=rdp_port
        )
        if host:
            if is_private_subnet(socket.gethostbyname(host)):
                machine.private_ips = [host]
            else:
                machine.hostname = host
                machine.public_ips = [host]
        machine.save()

        # Attempt to connect.
        if os_type == 'unix' and ssh_key:
            if not ssh_user:
                ssh_user = 'root'
            # Try to connect. If it works, it will create the association.
            try:
                if not host:
                    raise BadRequestError("You have specified an SSH key but "
                                          "machine hostname is empty.")
                to_tunnel(self.cloud.owner, host)  # May raise VPNTunnelError
                ssh_command(
                    self.cloud.owner, self.cloud.id, machine.machine_id, host,
                    'uptime', key_id=ssh_key.id, username=ssh_user,
                    port=ssh_port
                )
            except MachineUnauthorizedError as exc:
                if fail_on_error:
                    machine.delete()
                raise CloudUnauthorizedError(exc)
            except ServiceUnavailableError as exc:
                if fail_on_error:
                    machine.delete()
                raise MistError("Couldn't connect to host '%s'." % host)
            except:
                if fail_on_error:
                    machine.delete()
                raise

        return machine
