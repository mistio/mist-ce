import uuid
import logging
from pyramid.response import Response

import mist.io.machines.methods as methods

from mist.io.clouds.models import Cloud
from mist.io.machines.models import Machine

from mist.io import tasks

from mist.io.auth.methods import auth_context_from_request
from mist.io.helpers import view_config, params_from_request

from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import BadRequestError, NotFoundError

#  TODO handle this for open.source, it is used from machine_rdp
from mist.core.vpn.methods import destination_nat
from mist.core import config

logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)


@view_config(route_name='api_v1_machines',
             request_method='GET', renderer='json')
def list_machines(request):
    """
    List machines on cloud
    Gets machines and their metadata from a cloud
    Check Permissions take place in filter_list_machines
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    # SEC get filtered resources based on auth_context
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    machines = methods.filter_list_machines(auth_context, cloud_id)

    if cloud.machine_count != len(machines):
        try:
            tasks.update_machine_count.delay(
                auth_context.owner.id, cloud_id, len(machines))
        except Exception as e:
            log.error('Cannot update machine count for user %s: %r' %
                      (auth_context.owner.id, e))

    return machines


@view_config(route_name='api_v1_machines', request_method='POST',
             renderer='json')
def create_machine(request):
    """
    Create machine(s) on cloud
    Creates one or more machines on the specified cloud. If async is true, a
    jobId will be returned.
    READ permission required on cloud.
    CREATE_RESOURCES permissn required on cloud.
    CREATE permission required on machine.
    RUN permission required on script.
    READ permission required on key.

    ---
    cloud:
      in: path
      required: true
      type: string
    async:
      description: ' Create machines asynchronously, returning a jobId'
      type: boolean
    quantity:
      description: ' The number of machines that will be created, async only'
      type: integer
    azure_port_bindings:
      type: string
    cloud_id:
      description: The Cloud ID
      required: true
      type: string
    disk:
      description: ' Only required by Linode cloud'
      type: string
    docker_command:
      type: string
    docker_env:
      items:
        type: string
      type: array
    docker_exposed_ports:
      type: object
    docker_port_bindings:
      type: object
    hostname:
      type: string
    image_extra:
      description: ' Needed only by Linode cloud'
      type: string
    image:
      description: ' Id of image to be used with the creation'
      required: true
      type: string
    image_name:
      type: string
    ips:
      type: string
    job_id:
      type: string
    key_id:
      description: ' Associate machine with this key_id'
      required: true
      type: string
    location_id:
      description: ' Id of the cloud''s location to create the machine'
      required: true
      type: string
    location_name:
      type: string
    machine_name:
      required: true
      type: string
    monitoring:
      type: string
    networks:
      items:
        type: string
      type: array
    plugins:
      items:
        type: string
      type: array
    post_script_id:
      type: string
    post_script_params:
      type: string
    script:
      type: string
    script_id:
      type: string
    script_params:
      type: string
    size_id:
      description: ' Id of the size of the machine'
      required: true
      type: string
    size_name:
      type: string
    ssh_port:
      type: integer
    softlayer_backend_vlan_id:
      description: 'Specify id of a backend(private) vlan'
      type: integer
    project_id:
      description: ' Needed only by Packet.net cloud'
      type: string
    billing:
      description: ' Needed only by SoftLayer cloud'
      type: string
    bare_metal:
      description: ' Needed only by SoftLayer cloud'
      type: string
    """
    # TODO add schedule in docstring

    params = params_from_request(request)
    cloud_id = request.matchdict['cloud']

    for key in ('name', 'size'):
        if key not in params:
            raise RequiredParameterMissingError(key)

    key_id = params.get('key')
    machine_name = params['name']
    location_id = params.get('location', None)
    image_id = params.get('image')
    if not image_id:
        raise RequiredParameterMissingError("image")
    # this is used in libvirt
    disk_size = int(params.get('libvirt_disk_size', 4))
    disk_path = params.get('libvirt_disk_path', '')
    size_id = params['size']
    # deploy_script received as unicode, but ScriptDeployment wants str
    script = str(params.get('script', ''))
    # these are required only for Linode/GCE, passing them anyway
    image_extra = params.get('image_extra', None)
    disk = params.get('disk', None)
    image_name = params.get('image_name', None)
    size_name = params.get('size_name', None)
    location_name = params.get('location_name', None)
    ips = params.get('ips', None)
    monitoring = params.get('monitoring', False)
    networks = params.get('networks', [])
    docker_env = params.get('docker_env', [])
    docker_command = params.get('docker_command', None)
    script_id = params.get('script_id', '')
    script_params = params.get('script_params', '')
    post_script_id = params.get('post_script_id', '')
    post_script_params = params.get('post_script_params', '')
    async = params.get('async', False)
    quantity = params.get('quantity', 1)
    persist = params.get('persist', False)
    docker_port_bindings = params.get('docker_port_bindings', {})
    docker_exposed_ports = params.get('docker_exposed_ports', {})
    azure_port_bindings = params.get('azure_port_bindings', '')
    # hostname: if provided it will be attempted to assign a DNS name
    hostname = params.get('hostname', '')
    plugins = params.get('plugins')
    cloud_init = params.get('cloud_init', '')
    associate_floating_ip = params.get('associate_floating_ip', False)
    associate_floating_ip_subnet = params.get('attach_floating_ip_subnet',
                                              None)
    project_id = params.get('project', None)
    bare_metal = params.get('bare_metal', False)
    # bare_metal True creates a hardware server in SoftLayer,
    # whule bare_metal False creates a virtual cloud server
    # hourly True is the default setting for SoftLayer hardware
    # servers, while False means the server has montly pricing
    softlayer_backend_vlan_id = params.get('softlayer_backend_vlan_id', None)
    hourly = params.get('billing', True)
    job_id = params.get('job_id', uuid.uuid4().hex)

    auth_context = auth_context_from_request(request)

    try:
        Cloud.objects.get(owner=auth_context.owner,
                          id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    # compose schedule as a dict from relative parameters
    if not params.get('schedule_type'):
        schedule = {}
    else:
        if params.get('schedule_type') not in ['crontab',
                                               'interval', 'one_off']:
            raise BadRequestError('schedule type must be one of '
                                  'these (crontab, interval, one_off)]'
                                  )
        if params.get('schedule_entry') == {}:
            raise RequiredParameterMissingError('schedule_entry')

        schedule = {
            'name': 'scheduler_' + params.get('name'),
            'description': params.get('description', ''),
            'action': params.get('action', ''),
            'script_id': params.get('schedule_script_id', ''),
            'schedule_type': params.get('schedule_type'),
            'schedule_entry': params.get('schedule_entry'),
            'expires': params.get('expires', ''),
            'start_after': params.get('start_after', ''),
            'max_run_count': params.get('max_run_count'),
            'task_enabled': bool(params.get('task_enabled', True)),
            'auth_context': auth_context.serialize(),
        }

    auth_context.check_perm("cloud", "read", cloud_id)
    auth_context.check_perm("cloud", "create_resources", cloud_id)
    tags = auth_context.check_perm("machine", "create", None)
    if script_id:
        auth_context.check_perm("script", "run", script_id)
    if key_id:
        auth_context.check_perm("key", "read", key_id)

    args = (cloud_id, key_id, machine_name,
            location_id, image_id, size_id,
            image_extra, disk, image_name, size_name,
            location_name, ips, monitoring, networks,
            docker_env, docker_command)
    kwargs = {'script_id': script_id,
              'script_params': script_params, 'script': script,
              'job_id': job_id, 'docker_port_bindings': docker_port_bindings,
              'docker_exposed_ports': docker_exposed_ports,
              'azure_port_bindings': azure_port_bindings,
              'hostname': hostname, 'plugins': plugins,
              'post_script_id': post_script_id,
              'post_script_params': post_script_params,
              'disk_size': disk_size,
              'disk_path': disk_path,
              'cloud_init': cloud_init,
              'associate_floating_ip': associate_floating_ip,
              'associate_floating_ip_subnet': associate_floating_ip_subnet,
              'project_id': project_id,
              'bare_metal': bare_metal,
              'tags': tags,
              'hourly': hourly,
              'schedule': schedule,
              'softlayer_backend_vlan_id': softlayer_backend_vlan_id}
    if not async:
        ret = methods.create_machine(auth_context.owner, *args, **kwargs)
    else:
        args = (auth_context.owner.id, ) + args
        kwargs.update({'quantity': quantity, 'persist': persist})
        tasks.create_machine_async.apply_async(args, kwargs, countdown=2)
        ret = {'job_id': job_id}
    return ret


@view_config(route_name='api_v1_machine',
             request_method='POST', renderer='json')
def machine_actions(request):
    """
    Call an action on machine
    Calls a machine action on cloud that support it
    READ permission required on cloud.
    ACTION permission required on machine(ACTION can be START,
    STOP, DESTROY, REBOOT).
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    action:
      enum:
      - start
      - stop
      - reboot
      - destroy
      - resize
      - rename
      required: true
      type: string
    name:
      description: The new name of the renamed machine
      type: string
    size:
      description: The size id of the plan to resize
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    action = params.get('action', '')
    plan_id = params.get('plan_id', '')
    name = params.get('name', '')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)

    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except Machine.DoesNotExist:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)

    if machine.cloud.owner != auth_context.owner:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)

    auth_context.check_perm("machine", action, machine.id)

    actions = ('start', 'stop', 'reboot', 'destroy', 'resize',
               'rename', 'undefine', 'suspend', 'resume')

    if action not in actions:
        raise BadRequestError("Action '%s' should be "
                              "one of %s" % (action, actions)
                              )
    if action == 'destroy':
        methods.destroy_machine(auth_context.owner, cloud_id, machine_id)
    elif action in ('start', 'stop', 'reboot',
                    'undefine', 'suspend', 'resume'):
        getattr(machine.ctl, action)()
    elif action == 'rename':
        if not name:
            raise BadRequestError("You must give a name!")
        getattr(machine.ctl, action)(name)
    elif action == 'resize':
        getattr(machine.ctl, action)(plan_id)

    # TODO: We shouldn't return list_machines, just OK. Save the API!
    return methods.filter_list_machines(auth_context, cloud_id)


@view_config(route_name='api_v1_machine_rdp',
             request_method='GET', renderer='json')
def machine_rdp(request):
    """
    Rdp file for windows machines
    Generate and return an rdp file for windows machines
    READ permission required on cloud.
    READ permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    rdp_port:
      default: 3389
      in: query
      required: true
      type: integer
    host:
      in: query
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except Machine.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)
    rdp_port = request.params.get('rdp_port', 3389)
    host = request.params.get('host')

    if not host:
        raise BadRequestError('no hostname specified')
    try:
        1 < int(rdp_port) < 65535
    except:
        rdp_port = 3389

    host, rdp_port = destination_nat(auth_context.owner, host, rdp_port)

    rdp_content = 'full address:s:%s:%s\nprompt for credentials:i:1' % \
                  (host, rdp_port)
    return Response(content_type='application/octet-stream',
                    content_disposition='attachment; filename="%s.rdp"' % host,
                    charset='utf8',
                    pragma='no-cache',
                    body=rdp_content)
