"""Cloud Controllers

A cloud controller handles all main operations that can be performed on a
specific cloud by subclassing and extending the `BaseController`.

A cloud controller also extends the `BaseController` by initialising
sub-controllers, which are utilizing libcloud in order to perform API calls to
the various cloud providers. Initially, all cloud controllers MUST implement a
sub-controller of class `ComputeController` in order to perform basic API calls
to cloud providers via libcloud's compute API.

For each different cloud type, there is a corresponding cloud controller
defined here. All the different classes inherit `BaseController` and share a
commmon interface, with the exception that some controllers may not have
implemented all methods.

A cloud controller is initialized given a cloud. Most of the time it will be
accessed through a cloud model, using the `ctl` abbreviation, like this:

    cloud = mist.io.clouds.models.Cloud.objects.get(id=cloud_id)
    cloud.ctl.enable()

In order to perform libcloud operations the corresponding sub-controller must
be invoked, as such:

    cloud.ctl.compute.list_machines()

"""


import uuid
import json
import socket
import logging
import tempfile

import mongoengine as me

from libcloud.compute.providers import get_driver
from libcloud.compute.types import Provider
from libcloud.utils.networking import is_private_subnet

from mist.io import config

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
from mist.core.vpn.methods import destination_nat as dnat
from mist.core.vpn.methods import to_tunnel

from mist.io.bare_metal import BareMetalDriver

from mist.io.clouds.main.base import BaseController, rename_kwargs
from mist.io.clouds.compute.base import ComputeController

import mist.io.clouds.compute.controllers as compute_controllers
import mist.io.clouds.network.controllers as network_controllers


log = logging.getLogger(__name__)


class AmazonController(BaseController):

    provider = 'ec2'

    def __init__(self, cloud):
        super(AmazonController, self).__init__(cloud)
        self.compute = compute_controllers.AmazonComputeController(self)
        self.network = network_controllers.AmazonNetworkController(self)

    def _connect(self):
        return get_driver(Provider.EC2)(self.cloud.apikey,
                                        self.cloud.apisecret,
                                        region=self.cloud.region)

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

    def __init__(self, cloud):
        super(DigitalOceanController, self).__init__(cloud)
        self.compute = compute_controllers.DigitalOceanComputeController(self)

    def _connect(self):
        return get_driver(Provider.DIGITAL_OCEAN)(self.cloud.token)


class LinodeController(BaseController):

    provider = 'linode'

    def __init__(self, cloud):
        super(LinodeController, self).__init__(cloud)
        self.compute = compute_controllers.LinodeComputeController(self)

    def _connect(self):
        return get_driver(Provider.LINODE)(self.cloud.apikey)


class RackSpaceController(BaseController):

    provider = 'rackspace'

    def __init__(self, cloud):
        super(RackSpaceController, self).__init__(cloud)
        self.compute = compute_controllers.RackSpaceComputeController(self)

    def _connect(self):
        if self.cloud.region in ('us', 'uk'):
            driver = get_driver(Provider.RACKSPACE_FIRST_GEN)
        else:
            driver = get_driver(Provider.RACKSPACE)
        return driver(self.cloud.username, self.cloud.apikey,
                      region=self.cloud.region)

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

    def __init__(self, cloud):
        super(SoftLayerController, self).__init__(cloud)
        self.compute = compute_controllers.SoftLayerComputeController(self)

    def _connect(self):
        return get_driver(Provider.SOFTLAYER)(self.cloud.username,
                                              self.cloud.apikey)


class NephoScaleController(BaseController):

    provider = 'nephoscale'

    def __init__(self, cloud):
        super(NephoScaleController, self).__init__(cloud)
        self.compute = compute_controllers.NephoScaleComputeController(self)

    def _connect(self):
        return get_driver(Provider.NEPHOSCALE)(self.cloud.username,
                                               self.cloud.password)


class AzureController(BaseController):

    provider = 'azure'

    def __init__(self, cloud):
        super(AzureController, self).__init__(cloud)
        self.compute = compute_controllers.AzureComputeController(self)

    def _connect(self):
        tmp_cert_file = tempfile.NamedTemporaryFile(delete=False)
        tmp_cert_file.write(self.cloud.certificate)
        tmp_cert_file.close()
        return get_driver(Provider.AZURE)(self.cloud.subscription_id,
                                          tmp_cert_file.name)


class AzureArmController(BaseController):

    provider = 'azure_arm'

    def __init__(self, cloud):
        super(AzureArmController, self).__init__(cloud)
        self.compute = compute_controllers.AzureArmComputeController(self)

    def _connect(self):
        return get_driver(Provider.AZURE_ARM)(self.cloud.tenant_id,
                                              self.cloud.subscription_id,
                                              self.cloud.key,
                                              self.cloud.secret)


class GoogleController(BaseController):

    provider = 'gce'

    def __init__(self, cloud):
        super(GoogleController, self).__init__(cloud)
        self.compute = compute_controllers.GoogleComputeController(self)
        self.network = network_controllers.GoogleNetworkController(self)

    def _connect(self):
        return get_driver(Provider.GCE)(self.cloud.email,
                                        self.cloud.private_key,
                                        project=self.cloud.project_id)

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

    def __init__(self, cloud):
        super(HostVirtualController, self).__init__(cloud)
        self.compute = ComputeController(self)

    def _connect(self):
        return get_driver(Provider.HOSTVIRTUAL)(self.cloud.apikey)


class PacketController(BaseController):

    provider = 'packet'

    def __init__(self, cloud):
        super(PacketController, self).__init__(cloud)
        self.compute = compute_controllers.PacketComputeController(self)

    def _connect(self):
        return get_driver(Provider.PACKET)(self.cloud.apikey,
                                           project=self.cloud.project_id)


class VultrController(BaseController):

    provider = 'vultr'

    def __init__(self, cloud):
        super(VultrController, self).__init__(cloud)
        self.compute = compute_controllers.VultrComputeController(self)

    def _connect(self):
        return get_driver(Provider.VULTR)(self.cloud.apikey)


class VSphereController(BaseController):

    provider = 'vsphere'

    def __init__(self, cloud):
        super(VSphereController, self).__init__(cloud)
        self.compute = ComputeController(self)

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(Provider.VSPHERE)(host=host,
                                            username=self.cloud.username,
                                            password=self.cloud.password)

    def check_connection(self):
        """Check connection without performing `list_machines`

        In vSphere we are sure we got a successful connection with the provider
        if `self.connect` works, no need to run a `list_machines` to find out.

        """
        self.connect()

    def _update__preparse_kwargs(self, kwargs):
        host = kwargs.get('host', self.cloud.host)
        if host:
            kwargs['host'] = sanitize_host(host)
            check_host(kwargs['host'])


class VCloudController(BaseController):

    provider = 'vcloud'

    def __init__(self, cloud):
        super(VCloudController, self).__init__(cloud)
        self.compute = compute_controllers.VCloudComputeController(self)

    def _connect(self):
        host = dnat(self.cloud.owner, self.cloud.host)
        return get_driver(self.provider)(self.cloud.username,
                                         self.cloud.password, host=host,
                                         verify_match_hostname=False)

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

    def __init__(self, cloud):
        super(IndonesianVCloudController, self).__init__(cloud)
        self.compute = ComputeController(self)

    def _update__preparse_kwargs(self, kwargs):
        host = kwargs.get('host', self.cloud.host) or 'my.idcloudonline.com'
        if host not in ('my.idcloudonline.com', 'compute.idcloudonline.com'):
            raise me.ValidationError("Invalid host '%s'." % host)
        super(IndonesianVCloudController,
              self)._update__preparse_kwargs(kwargs)


class OpenStackController(BaseController):

    provider = 'openstack'

    def __init__(self, cloud):
        super(OpenStackController, self).__init__(cloud)
        self.compute = compute_controllers.OpenStackComputeController(self)
        self.network = network_controllers.OpenStackNetworkController(self)

    def _connect(self):
        url = dnat(self.cloud.owner, self.cloud.url)
        return get_driver(Provider.OPENSTACK)(
            self.cloud.username,
            self.cloud.password,
            ex_force_auth_version='2.0_password',
            ex_force_auth_url=url,
            ex_tenant_name=self.cloud.tenant,
            ex_force_service_region=self.cloud.region,
            ex_force_base_url=self.cloud.compute_endpoint,
        )

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

    def __init__(self, cloud):
        super(DockerController, self).__init__(cloud)
        self.compute = compute_controllers.DockerComputeController(self)

    def _connect(self):
        host, port = dnat(self.cloud.owner, self.cloud.host, self.cloud.port)

        # TLS authentication.
        if self.cloud.key_file and self.cloud.cert_file:
            key_temp_file = tempfile.NamedTemporaryFile(delete=False)
            key_temp_file.write(self.cloud.key_file)
            key_temp_file.close()
            cert_temp_file = tempfile.NamedTemporaryFile(delete=False)
            cert_temp_file.write(self.cloud.cert_file)
            cert_temp_file.close()
            ca_cert = None
            if self.cloud.ca_cert_file:
                ca_cert_temp_file = tempfile.NamedTemporaryFile(delete=False)
                ca_cert_temp_file.write(self.cloud.ca_cert_file)
                ca_cert_temp_file.close()
                ca_cert = ca_cert_temp_file.name
            # FIXME: The docker_host logic should come out of libcloud into
            # DockerController.compute.list_machines
            return get_driver(Provider.DOCKER)(host=host,
                                               port=port,
                                               docker_host=self.cloud.host,
                                               key_file=key_temp_file.name,
                                               cert_file=cert_temp_file.name,
                                               ca_cert=ca_cert,
                                               verify_match_hostname=False)

        # Username/Password authentication.
        return get_driver(Provider.DOCKER)(self.cloud.username,
                                           self.cloud.password,
                                           host, port,
                                           docker_host=self.cloud.host)

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

    def __init__(self, cloud):
        super(LibvirtController, self).__init__(cloud)
        self.compute = compute_controllers.LibvirtComputeController(self)

    def _connect(self):
        """Three supported ways to connect: local system, qemu+tcp, qemu+ssh"""

        import libcloud.compute.drivers.libvirt_driver
        libvirt_driver = libcloud.compute.drivers.libvirt_driver
        libvirt_driver.ALLOW_LIBVIRT_LOCALHOST = config.ALLOW_LIBVIRT_LOCALHOST

        if self.cloud.key:
            host, port = dnat(self.cloud.owner,
                              self.cloud.host, self.cloud.port)
            return get_driver(Provider.LIBVIRT)(host,
                                                hypervisor=self.cloud.host,
                                                user=self.cloud.username,
                                                ssh_key=self.cloud.key.private,
                                                ssh_port=int(port))
        else:
            host, port = dnat(self.cloud.owner, self.cloud.host, 5000)
            return get_driver(Provider.LIBVIRT)(host,
                                                hypervisor=self.cloud.host,
                                                user=self.cloud.username,
                                                tcp_port=int(port))

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

    def __init__(self, cloud):
        super(OtherController, self).__init__(cloud)
        self.compute = compute_controllers.OtherComputeController(self)

    def _connect(self):
        # FIXME: Move this to top of the file once Machine model is migrated.
        # The import statement is currently here to avoid circular import
        # issues.
        from mist.io.machines.models import Machine
        return BareMetalDriver(Machine.objects(cloud=self.cloud))

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
