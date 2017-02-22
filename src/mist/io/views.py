"""mist.io.views

Here we define the HTTP API of the app. The view functions here are
responsible for taking parameters from the web requests, passing them on to
functions defined in methods and properly formatting the output. This is the
only source file where we import things from pyramid. View functions should
only check that all required params are provided. Any further checking should
be performed inside the corresponding method functions.

"""

import requests
import json
import traceback
import mongoengine as me

from pyramid.response import Response
from pyramid.renderers import render_to_response
import pyramid.httpexceptions
# try:

from mist.io.scripts.models import CollectdScript
from mist.io.clouds.models import Cloud
from mist.io.dns.models import Zone, Record
from mist.io.machines.models import Machine
from mist.io.networks.models import Network, Subnet
from mist.io.users.models import Avatar, Owner
from mist.io.auth.models import SessionToken

from mist.core import config

# except ImportError:
#     from mist.io import config
#     from mist.io.helpers import user_from_request
#     from pyramid.view import view_config

from mist.io import methods

from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import NotFoundError, BadRequestError
from mist.io.exceptions import SSLError, ServiceUnavailableError
from mist.io.exceptions import KeyParameterMissingError, MistError
from mist.io.exceptions import PolicyUnauthorizedError, UnauthorizedError
from mist.io.exceptions import CloudNotFoundError, ScheduleTaskNotFound
from mist.io.exceptions import NetworkNotFoundError, SubnetNotFoundError

from mist.io.helpers import get_auth_header, params_from_request
from mist.io.helpers import trigger_session_update, amqp_publish_user
from mist.io.helpers import view_config

from mist.io.auth.methods import auth_context_from_request
from mist.io.auth.methods import user_from_request, session_from_request

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
log = logging.getLogger(__name__)

OK = Response("OK", 200)


@view_config(context=Exception)
def exception_handler_mist(exc, request):
    """Here we catch exceptions and transform them to proper http responses

    This is a special pyramid view that gets triggered whenever an exception
    is raised from any other view. It catches all exceptions exc where
    isinstance(exc, context) is True.

    """
    # mongoengine ValidationError
    if isinstance(exc, me.ValidationError):
        trace = traceback.format_exc()
        log.warning("Uncaught me.ValidationError!\n%s", trace)
        return Response("Validation Error", 400)

    # mongoengine NotUniqueError
    if isinstance(exc, me.NotUniqueError):
        trace = traceback.format_exc()
        log.warning("Uncaught me.NotUniqueError!\n%s", trace)
        return Response("NotUniqueError", 409)

    # non-mist exceptions. that shouldn't happen! never!
    if not isinstance(exc, MistError):
        if not isinstance(exc, (me.ValidationError, me.NotUniqueError)):
            trace = traceback.format_exc()
            log.critical("Uncaught non-mist exception? WTF!\n%s", trace)
            return Response("Internal Server Error", 500)

    # mist exceptions are ok.
    log.info("MistError: %r", exc)


    # translate it to HTTP response based on http_code attribute
    return Response(str(exc), exc.http_code)


#@view_config(context='pyramid.httpexceptions.HTTPNotFound',
#             renderer='templates/404.pt')
#def not_found(self, request):
#    return pyramid.httpexceptions.HTTPFound(request.host_url+"/#"+request.path)


@view_config(route_name='home', request_method='GET')
@view_config(route_name='clouds', request_method='GET')
@view_config(route_name='cloud', request_method='GET')
@view_config(route_name='machines', request_method='GET')
@view_config(route_name='machine', request_method='GET')
@view_config(route_name='images', request_method='GET')
@view_config(route_name='image', request_method='GET')
@view_config(route_name='keys', request_method='GET')
@view_config(route_name='key', request_method='GET')
@view_config(route_name='networks', request_method='GET')
@view_config(route_name='network', request_method='GET')
def home(request):
    """Home page view"""
    params = params_from_request(request)
    user = user_from_request(request)
    if params.get('ember'):
        template = 'home.pt'
    else:
        template = 'poly.pt'
    return render_to_response('templates/%s' % template,
        {
        'project': 'mist.io',
        'email': json.dumps(user.email),
        'first_name': json.dumps(""),
        'last_name': json.dumps(""),
        'supported_providers': json.dumps(config.SUPPORTED_PROVIDERS_V_2),
        'core_uri': json.dumps(config.CORE_URI),
        'auth': json.dumps(bool(user.mist_api_token)),
        'js_build': json.dumps(config.JS_BUILD),
        'css_build': config.CSS_BUILD,
        'js_log_level': json.dumps(config.JS_LOG_LEVEL),
        'google_analytics_id': config.GOOGLE_ANALYTICS_ID,
        'is_core': json.dumps(False),
        'csrf_token': json.dumps(""),
        'beta_features': json.dumps(False),
        'last_build': config.LAST_BUILD
        }, request=request)


@view_config(route_name='api_v1_zones', request_method='GET', renderer='json')
def list_dns_zones(request):
    """
    List all DNS zones.
    Retrieves a list of all DNS zones based on the user Clouds.
    For each cloud that supports DNS functionality, we get all available zones.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']

    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    return [zone.as_dict() for zone in cloud.ctl.dns.list_zones()]


@view_config(route_name='api_v1_records', request_method='GET', renderer='json')
def list_dns_records(request):
    """
    List all DNS zone records for a particular zone.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    zone_id = request.matchdict['zone']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')
    try:
        zone = Zone.objects.get(owner=auth_context.owner, cloud=cloud,
                                id=zone_id)
    except Zone.DoesNotExist:
        raise NotFoundError('Zone does not exist')

    return [record.as_dict() for record in zone.ctl.list_records()]

@view_config(route_name='api_v1_zones', request_method='POST', renderer='json')
def create_dns_zone(request):
    """
    Create a new DNS zone under a specific cloud.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    # Try to get the specific cloud for which we will create the zone.
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    params = params_from_request(request)
    return Zone.add(owner=cloud.owner, cloud=cloud, **params).as_dict()

@view_config(route_name='api_v1_records', request_method='POST', renderer='json')
def create_dns_record(request):
    """
    Create a new record under a specific zone
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    # Try to get the specific cloud for which we will create the zone.
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    zone_id = request.matchdict['zone']
    try:
        zone = Zone.objects.get(owner=auth_context.owner, id=zone_id)
    except Zone.DoesNotExist:
        raise NotFoundError('Zone does not exist')

    # Get the params and create the new record
    params = params_from_request(request)

    return Record.add(owner=auth_context.owner, zone=zone, **params).as_dict()

@view_config(route_name='api_v1_zone', request_method='DELETE', renderer='json')
def delete_dns_zone(request):
    """
    Delete a specific DNS zone under a cloud.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    zone_id = request.matchdict['zone']
    # Do we need the cloud here, now that the models have been created?
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')
    try:
        zone = Zone.objects.get(owner=auth_context.owner, id=zone_id)
    except Zone.DoesNotExist:
        raise NotFoundError('Zone does not exist')

    return zone.ctl.delete_zone()

@view_config(route_name='api_v1_record', request_method='DELETE', renderer='json')
def delete_dns_record(request):
    """
    Delete a specific DNS record under a zone.
    ---
    """
    auth_context = auth_context_from_request(request)
    cloud_id = request.matchdict['cloud']
    zone_id = request.matchdict['zone']
    record_id = request.matchdict['record']
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')
    try:
        zone = Zone.objects.get(owner=auth_context.owner, id=zone_id)
    except Zone.DoesNotExist:
        raise NotFoundError('Zone does not exist')
    try:
        record = Record.objects.get(zone=zone, id=record_id)
    except Record.DoesNotExist:
        raise NotFoundError('Record does not exist')

    return record.ctl.delete_record()


@view_config(route_name='api_v1_images', request_method='POST', renderer='json')
def list_specific_images(request):
    # FIXME: 1) i shouldn't exist, 2) i shouldn't be a post
    return list_images(request)


@view_config(route_name='api_v1_images', request_method='GET', renderer='json')
def list_images(request):
    """
    List images of specified cloud
    List images from each cloud. Furthermore if a search_term is provided, we
    loop through each cloud and search for that term in the ids and the names
    of the community images
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    search_term:
      type: string
    """

    cloud_id = request.matchdict['cloud']
    try:
        term = request.json_body.get('search_term', '')
    except:
        term = None
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')
    return methods.list_images(auth_context.owner, cloud_id, term)


@view_config(route_name='api_v1_image', request_method='POST', renderer='json')
def star_image(request):
    """
    Star/unstar an image
    Toggle image star (star/unstar)
    EDIT permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    image:
      description: Id of image to be used with the creation
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    image_id = request.matchdict['image']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "edit", cloud_id)
    return methods.star_image(auth_context.owner, cloud_id, image_id)


@view_config(route_name='api_v1_sizes', request_method='GET', renderer='json')
def list_sizes(request):
    """
    List sizes of a cloud
    List sizes (aka flavors) from each cloud.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_sizes(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_locations', request_method='GET', renderer='json')
def list_locations(request):
    """
    List locations of cloud
    List locations from each cloud. Locations mean different things in each cl-
    oud. e.g. EC2 uses it as a datacenter in a given availability zone, where-
    as Linode lists availability zones. However all responses share id, name
    and country even though in some cases might be empty, e.g. Openstack. In E-
    C2 all locations by a provider have the same name, so the availability zo-
    nes are listed instead of name.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    return methods.list_locations(auth_context.owner, cloud_id)


@view_config(route_name='api_v1_subnets', request_method='GET', renderer='json')
def list_subnets(request):
    """
    List subnets of a cloud
    Currently supports the EC2, GCE and OpenStack clouds.
    For other providers this returns an empty list.
    READ permission required on cloud.
    ---
    cloud:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      description: The DB ID of the network whose subnets will be returned
      type: string
    """

    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)

    try:
        cloud = Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError

    try:
        network = Network.objects.get(cloud=cloud, id=network_id)
    except Network.DoesNotExist:
        raise NetworkNotFoundError

    subnets = methods.list_subnets(cloud, network=network)

    return subnets


@view_config(route_name='api_v1_subnets', request_method='POST', renderer='json')
def create_subnet(request):
    """
    Create subnet on a given network on a cloud.
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      description: The Cloud ID
      type: string
    network_id:
      in: path
      required: true
      description: The ID of the Network that will contain the new subnet
      type: string
    subnet:
      required: true
      type: dict
    """
    cloud_id = request.matchdict['cloud']
    network_id = request.matchdict['network']

    params = params_from_request(request)

    auth_context = auth_context_from_request(request)

    # TODO
    if not auth_context.is_owner():
        raise PolicyUnauthorizedError()

    try:
        cloud = Cloud.objects.get(id=cloud_id, owner=auth_context.owner)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError
    try:
        network = Network.objects.get(id=network_id, cloud=cloud)
    except Network.DoesNotExist:
        raise NetworkNotFoundError

    subnet = methods.create_subnet(auth_context.owner, cloud, network, params)

    return subnet.as_dict()


@view_config(route_name='api_v1_subnet', request_method='DELETE')
def delete_subnet(request):
    """
    Delete a subnet.
    CREATE_RESOURCES permission required on cloud.
    ---
    cloud_id:
      in: path
      required: true
      type: string
    network_id:
      in: path
      required: true
      type: string
    subnet_id:
      in: path
      required: true
      type: string
    """
    cloud_id = request.matchdict['cloud']
    subnet_id = request.matchdict['subnet']
    network_id = request.matchdict['network']

    auth_context = auth_context_from_request(request)

    # TODO
    if not auth_context.is_owner():
        raise PolicyUnauthorizedError()

    try:
        cloud = Cloud.objects.get(id=cloud_id, owner=auth_context.owner)
    except Cloud.DoesNotExist:
        raise CloudNotFoundError

    try:
        network = Network.objects.get(id=network_id, cloud=cloud)
    except Network.DoesNotExist:
        raise NetworkNotFoundError

    try:
        subnet = Subnet.objects.get(id=subnet_id, network=network)
    except Subnet.DoesNotExist:
        raise SubnetNotFoundError

    methods.delete_subnet(auth_context.owner, subnet)

    return OK


@view_config(route_name='api_v1_probe', request_method='POST', renderer='json')
def probe(request):
    """
    Probe a machine
    Ping and SSH to machine and collect various metrics.
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
    host:
      type: string
    key:
      type: string
    ssh_user:
      default: ''
      description: ' Optional. Give if you explicitly want a specific user'
      in: query
      required: false
      type: string
    """
    machine_id = request.matchdict['machine']
    cloud_id = request.matchdict['cloud']
    params = params_from_request(request)
    host = params.get('host', None)
    key_id = params.get('key', None)
    ssh_user = params.get('ssh_user', '')
    # FIXME: simply don't pass a key parameter
    if key_id == 'undefined':
        key_id = ''
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)

    ret = methods.probe(auth_context.owner, cloud_id, machine_id, host, key_id,
                        ssh_user)
    amqp_publish_user(auth_context.owner, "probe",
                 {
                    'cloud_id': cloud_id,
                    'machine_id': machine_id,
                    'result': ret
                 })
    return ret


@view_config(route_name='api_v1_ping', request_method=('GET', 'POST'), renderer='json')
def ping(request):
    """
    Check that an api token is correct.
    ---
    """
    user = user_from_request(request)
    if isinstance(session_from_request(request), SessionToken):
        raise BadRequestError('This call is for users with api tokens')
    return {'hello': user.email}


@view_config(route_name='api_v1_monitoring', request_method='GET', renderer='json')
def check_monitoring(request):
    """
    Check monitoring
    Ask the mist.io service if monitoring is enabled for this machine.
    ---
    """
    raise NotImplementedError()

    user = user_from_request(request)
    ret = methods.check_monitoring(user)
    return ret


@view_config(route_name='api_v1_update_monitoring', request_method='POST', renderer='json')
def update_monitoring(request):
    """
    Enable monitoring
    Enable monitoring for a machine.
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
      - enable
      - disable
      type: string
    dns_name:
      type: string
    dry:
      default: false
      type: boolean
    name:
      description: ' Name of the plugin'
      type: string
    no_ssh:
      default: false
      type: boolean
    public_ips:
      items:
        type: string
      type: array
    """
    raise NotImplementedError()

    user = user_from_request(request)
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    if not user.mist_api_token:
        log.info("trying to authenticate to service first")
        email = params.get('email')
        password = params.get('password')
        if not email or not password:
            raise UnauthorizedError("You need to authenticate to mist.io.")
        payload = {'email': email, 'password': password}
        try:
            ret = requests.post(config.CORE_URI + '/auth', params=payload,
                                verify=config.SSL_VERIFY)
        except requests.exceptions.SSLError as exc:
            log.error("%r", exc)
            raise SSLError()
        if ret.status_code == 200:
            ret_dict = json.loads(ret.content)
            user.email = email
            user.mist_api_token = ret_dict.pop('token', '')
            user.save()
            log.info("succesfully check_authed")
        elif ret.status_code in [400, 401]:
            user.email = ""
            user.mist_api_token = ""
            user.save()
            raise UnauthorizedError("You need to authenticate to mist.io.")
        else:
            raise UnauthorizedError("You need to authenticate to mist.io.")

    action = params.get('action') or 'enable'
    name = params.get('name', '')
    public_ips = params.get('public_ips', [])  # TODO priv IPs?
    dns_name = params.get('dns_name', '')
    no_ssh = bool(params.get('no_ssh', False))
    dry = bool(params.get('dry', False))

    if action == 'enable':
        ret_dict = methods.enable_monitoring(
            user, cloud_id, machine_id, name, dns_name, public_ips,
            no_ssh=no_ssh, dry=dry
        )
    elif action == 'disable':
        methods.disable_monitoring(user, cloud_id, machine_id, no_ssh=no_ssh)
        ret_dict = {}
    else:
        raise BadRequestError()

    return ret_dict


@view_config(route_name='api_v1_stats', request_method='GET', renderer='json')
def get_stats(request):
    """
    Get monitor data for a machine
    Get all monitor data for this machine
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
    start:
      description: ' Time formatted as integer, from when to fetch stats (default now)'
      in: query
      required: false
      type: string
    stop:
      default: ''
      description: Time formatted as integer, until when to fetch stats (default +10 seconds)
      in: query
      required: false
      type: string
    step:
      default: ''
      description: ' Step to fetch stats (default 10 seconds)'
      in: query
      required: false
      type: string
    metrics:
      default: ''
      in: query
      required: false
      type: string
    request_id:
      default: ''
      in: query
      required: false
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)

    data = methods.get_stats(
        auth_context.owner,
        cloud_id,
        machine_id,
        request.params.get('start'),
        request.params.get('stop'),
        request.params.get('step'),
        request.params.get('metrics')
    )
    data['request_id'] = request.params.get('request_id')
    return data


@view_config(route_name='api_v1_metrics', request_method='GET', renderer='json')
def find_metrics(request):
    """
    Get metrics of a machine
    Get all metrics associated with specific machine
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
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "read", machine_uuid)
    return methods.find_metrics(auth_context.owner, cloud_id, machine_id)


@view_config(route_name='api_v1_metrics', request_method='PUT', renderer='json')
def assoc_metric(request):
    """
    Associate metric with machine
    Associate metric with specific machine
    READ permission required on cloud.
    EDIT_GRAPHS permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    metric_id:
      description: ' Metric_id '
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise RequiredParameterMissingError('metric_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_graphs", machine_uuid)
    methods.assoc_metric(auth_context.owner, cloud_id, machine_id, metric_id)
    return {}


@view_config(route_name='api_v1_metrics', request_method='DELETE', renderer='json')
def disassoc_metric(request):
    """
    Disassociate metric from machine
    Disassociate metric from specific machine
    READ permission required on cloud.
    EDIT_GRAPHS permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    metric_id:
      description: ' Metric_id '
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    metric_id = params.get('metric_id')
    if not metric_id:
        raise RequiredParameterMissingError('metric_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_graphs", machine_uuid)
    methods.disassoc_metric(auth_context.owner, cloud_id, machine_id,
                            metric_id)
    return {}


@view_config(route_name='api_v1_metric', request_method='PUT', renderer='json')
def update_metric(request):
    """
    Update a metric configuration
    Update a metric configuration
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    metric:
      description: ' Metric_id (provided by self.get_stats() )'
      in: path
      required: true
      type: string
    cloud_id:
      required: true
      type: string
    host:
      type: string
    machine_id:
      required: true
      type: string
    name:
      description: Name of the plugin
      type: string
    plugin_type:
      type: string
    unit:
      description: ' Optional. If given the new plugin will be measured according to this
        unit'
      type: string
    """
    raise NotImplementedError()

    metric_id = request.matchdict['metric']
    params = params_from_request(request)
    machine_id = params.get('machine_id')
    cloud_id = params.get('cloud_id')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_custom_metrics", machine_uuid)
    methods.update_metric(
        auth_context.owner,
        metric_id,
        name=params.get('name'),
        unit=params.get('unit'),
        cloud_id=cloud_id,
        machine_id=machine_id
    )
    return {}


@view_config(route_name='api_v1_deploy_plugin', request_method='POST', renderer='json')
def deploy_plugin(request):
    """
    Deploy a plugin on a machine.
    Deploy a plugin on the specific machine.
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    plugin:
      in: path
      required: true
      type: string
    name:
      required: true
      type: string
    plugin_type:
      default: python
      enum:
      - python
      required: true
      type: string
    read_function:
      required: true
      type: string
    unit:
      type: string
    value_type:
      default: gauge
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    auth_context = auth_context_from_request(request)
    # SEC check permission READ on cloud
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)

    # SEC check permission EDIT_CUSTOM_METRICS on machine
    auth_context.check_perm("machine", "edit_custom_metrics", machine.id)

    try:
        Cloud.objects.get(owner=auth_context.owner, id=cloud_id)
    except me.DoesNotExist:
        raise NotFoundError('Cloud id %s does not exist' % cloud_id)

    if not machine.monitoring.hasmonitoring:
        raise NotFoundError("Machine doesn't seem to have monitoring enabled")

    # create a collectdScript
    extra = {'value_type': params.get('value_type', 'gauge'),
             'value_unit': ''}
    name = plugin_id
    kwargs = {'location_type': 'inline',
              'script': params.get('read_function'),
              'extra': extra}
    script = CollectdScript.add(auth_context.owner, name, **kwargs)

    if plugin_type == 'python':
        ret = script.ctl.deploy_python_plugin(machine)
        methods.update_metric(
            auth_context.owner,
            metric_id=ret['metric_id'],
            name=params.get('name'),
            unit=params.get('unit'),
            cloud_id=cloud_id,
            machine_id=machine_id,
        )
        return ret
    else:
        raise BadRequestError("Invalid plugin_type: '%s'" % plugin_type)


@view_config(route_name='api_v1_deploy_plugin',
             request_method='DELETE', renderer='json')
def undeploy_plugin(request):
    """
    Undeploy a plugin on a machine.
    Undeploy a plugin on the specific machine.
    READ permission required on cloud.
    EDIT_CUSTOM_METRICS required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    plugin:
      in: path
      required: true
      type: string
    host:
      required: true
      type: string
    plugin_type:
      default: python
      enum:
      - python
      required: true
      type: string
    """
    raise NotImplementedError()

    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    plugin_id = request.matchdict['plugin']
    params = params_from_request(request)
    plugin_type = params.get('plugin_type')
    host = params.get('host')
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
        machine_uuid = machine.id
    except me.DoesNotExist:
        machine_uuid = ""
    auth_context.check_perm("machine", "edit_custom_metrics", machine_uuid)
    if plugin_type == 'python':
        ret = methods.undeploy_python_plugin(auth_context.owner, cloud_id,
                                             machine_id, plugin_id, host)
        return ret
    else:
        raise BadRequestError("Invalid plugin_type: '%s'" % plugin_type)


# @view_config(route_name='metric', request_method='DELETE', renderer='json')
# def remove_metric(request):
    # user = user_from_request(request)
    # metric_id = request.matchdict['metric']
    # url = "%s/metrics/%s" % (config.CORE_URI, metric_id)
    # headers={'Authorization': get_auth_header(user)}
    # try:
        # resp = requests.delete(url, headers=headers,
        #                        verify=config.SSL_VERIFY)
    # except requests.exceptions.SSLError as exc:
        # raise SSLError()
    # except Exception as exc:
        # log.error("Exception removing metric: %r", exc)
        # raise exceptions.ServiceUnavailableError()
    # if not resp.ok:
        # log.error("Error removing metric %d:%s", resp.status_code, resp.text)
        # raise exceptions.BadRequestError(resp.text)
    # return resp.json()


@view_config(route_name='api_v1_rules', request_method='POST', renderer='json')
def update_rule(request):
    """
    Creates or updates a rule.
    ---
    """
    raise NotImplementedError()

    user = user_from_request(request)
    params = params_from_request(request)
    try:
        ret = requests.post(
            config.CORE_URI + request.path,
            params=params,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error updating rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    trigger_session_update(user, ['monitoring'])
    return ret.json()


@view_config(route_name='api_v1_rule', request_method='DELETE')
def delete_rule(request):
    """
    Delete rule
    Deletes a rule.
    ---
    rule:
      description: ' Rule id '
      in: path
      required: true
      type: string
    """
    raise NotImplementedError()

    user = user_from_request(request)
    try:
        ret = requests.delete(
            config.CORE_URI + request.path,
            headers={'Authorization': get_auth_header(user)},
            verify=config.SSL_VERIFY
        )
    except requests.exceptions.SSLError as exc:
        log.error("%r", exc)
        raise SSLError()
    if ret.status_code != 200:
        log.error("Error deleting rule %d:%s", ret.status_code, ret.text)
        raise ServiceUnavailableError()
    trigger_session_update(user, ['monitoring'])
    return OK


@view_config(route_name='api_v1_providers', request_method='GET', renderer='json')
def list_supported_providers(request):
    """
    List supported providers
    Return all of our SUPPORTED PROVIDERS
    ---
    api_version:
      enum:
      - 1
      - 2
      in: header
      type: integer
    """
    api_version = request.headers.get('Api-Version', 1)
    if int(api_version) == 2:
        return {'supported_providers': config.SUPPORTED_PROVIDERS_V_2}
    else:
        return {'supported_providers': config.SUPPORTED_PROVIDERS}


@view_config(route_name='api_v1_avatars',
             request_method='POST', renderer='json')
def upload_avatar(request):
    user = user_from_request(request)
    body = request.POST['file'].file.read()
    if len(body) > 256*1024:
        raise BadRequestError("File too large")
    from mist.io.users.models import Avatar
    avatar = Avatar()
    avatar.owner = user
    avatar.body = body
    avatar.save()
    return {'id': avatar.id}


@view_config(route_name='api_v1_avatar', request_method='GET')
def get_avatar(request):
    """
    Returns the requested avatar
    ---
    avatar:
      description: 'Avatar Id'
      in: path
      required: true
      type: string
    """
    avatar_id = request.matchdict['avatar']

    try:
        avatar = Avatar.objects.get(id=avatar_id)
    except me.DoesNotExist:
        raise NotFoundError()

    return Response(content_type=str(avatar.content_type), body=str(avatar.body))


@view_config(route_name='api_v1_avatar', request_method='DELETE')
def delete_avatar(request):
    """
    Deletes the requested avatar
    ---
    avatar:
      description: 'Avatar Id'
      in: path
      required: true
      type: string
    """
    avatar_id = request.matchdict['avatar']
    auth_context = auth_context_from_request(request)

    try:
        avatar = Avatar.objects.get(id=avatar_id, owner=auth_context.user)
    except me.DoesNotExist:
        raise NotFoundError()

    try:
        org = Owner.objects.get(avatar=avatar_id)
        org.avatar = ''
        org.save()
    except me.DoesNotExist:
        pass

    avatar.delete()
    trigger_session_update(auth_context.owner, ["org"])
    return OK

