import mongoengine as me
from pyramid.response import Response

from mist.io.clouds.models import Cloud
from mist.io.machines.models import Machine
from mist.io.keys.models import SignedSSHKey, SSHKey, Key

from mist.io.auth.methods import auth_context_from_request

from mist.io.helpers import view_config, params_from_request
from mist.io.helpers import transform_key_machine_associations

from mist.io.keys.methods import filter_list_keys
from mist.io.keys.methods import delete_key as m_delete_key

from mist.io.exceptions import PolicyUnauthorizedError
from mist.io.exceptions import BadRequestError, KeyParameterMissingError
from mist.io.exceptions import RequiredParameterMissingError, NotFoundError

from mist.io.tag.methods import add_tags_to_resource

OK = Response("OK", 200)


@view_config(route_name='api_v1_keys', request_method='GET', renderer='json')
def list_keys(request):
    """
    List keys
    Retrieves a list of all added keys
    READ permission required on key.
    ---
    """
    auth_context = auth_context_from_request(request)
    return filter_list_keys(auth_context)


@view_config(route_name='api_v1_keys', request_method='PUT', renderer='json')
def add_key(request):
    """
    Add key
    Add key with specific name
    ADD permission required on key.
    ---
    id:
      description: The key name
      required: true
      type: string
    priv:
      description: The private key
      required: true
      type: string
    certificate:
      description: The signed public key, when using signed ssh keys
      required: false
      type: string

    """
    params = params_from_request(request)
    key_name = params.pop('name', None)
    private_key = params.get('priv', None)
    certificate = params.get('certificate', None)
    auth_context = auth_context_from_request(request)
    key_tags = auth_context.check_perm("key", "add", None)

    if not key_name:
        raise BadRequestError("Key name is not provided")
    if not private_key:
        raise RequiredParameterMissingError("Private key is not provided")

    if certificate:
        key = SignedSSHKey.add(auth_context.owner, key_name, **params)
    else:
        key = SSHKey.add(auth_context.owner, key_name, **params)

    if key_tags:
        add_tags_to_resource(auth_context.owner, key, key_tags.items())
    # since its a new key machines fields should be an empty list

    clouds = Cloud.objects(owner=auth_context.owner, deleted=None)
    machines = Machine.objects(cloud__in=clouds,
                               key_associations__keypair__exact=key)

    assoc_machines = transform_key_machine_associations(machines, key)

    return {'id': key.id,
            'name': key.name,
            'machines': assoc_machines,
            'isDefault': key.default}


@view_config(route_name='api_v1_key_action', request_method='DELETE',
             renderer='json')
def delete_key(request):
    """
    Delete key
    Delete key. When a key gets deleted, it takes its associations with it
    so just need to remove from the server too. If the default key gets
    deleted, it sets the next one as default, provided that at least another
    key exists. It returns the list of all keys after the deletion,
    excluding the private keys (check also list_keys).
    REMOVE permission required on key.
    ---
    key:
      in: path
      required: true
      type: string
    """
    auth_context = auth_context_from_request(request)
    key_id = request.matchdict.get('key')
    if not key_id:
        raise KeyParameterMissingError()

    try:
        key = Key.objects.get(owner=auth_context.owner, id=key_id,
                              deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'remove', key.id)
    m_delete_key(auth_context.owner, key_id)
    return list_keys(request)


@view_config(route_name='api_v1_keys',
             request_method='DELETE', renderer='json')
@view_config(route_name='keys', request_method='DELETE', renderer='json')
def delete_keys(request):
    """
    Delete multiple keys.
    Provide a list of key ids to be deleted. The method will try to delete
    all of them and then return a json that describes for each key id
    whether or not it was deleted or not_found if the key id could not
    be located. If no key id was found then a 404(Not Found) response will
    be returned.
    REMOVE permission required on each key.
    ---
    key_ids:
      required: true
      type: array
      items:
        type: string
        name: key_id
    """
    auth_context = auth_context_from_request(request)

    params = params_from_request(request)
    key_ids = params.get('key_ids', [])
    if type(key_ids) != list or len(key_ids) == 0:
        raise RequiredParameterMissingError('No key ids provided')
    # remove duplicate ids if there are any
    key_ids = set(key_ids)

    report = {}
    for key_id in key_ids:
        try:
            key = Key.objects.get(owner=auth_context.owner,
                                  id=key_id, deleted=None)
        except me.DoesNotExist:
            report[key_id] = 'not_found'
            continue
        try:
            auth_context.check_perm('key', 'remove', key.id)
        except PolicyUnauthorizedError:
            report[key_id] = 'unauthorized'
        else:
            delete_key(auth_context.owner, key_id)
            report[key_id] = 'deleted'

    # if no key id was valid raise exception
    if len(filter(lambda key_id: report[key_id] == 'not_found',
                  report)) == len(key_ids):
        raise NotFoundError('No valid key id provided')
    # if user was unauthorized for all keys
    if len(filter(lambda key_id: report[key_id] == 'unauthorized',
                  report)) == len(key_ids):
        raise NotFoundError('Unauthorized to modify any of the keys')
    return report


@view_config(route_name='api_v1_key_action', request_method='PUT',
             renderer='json')
def edit_key(request):
    """
    Edit a key
    Edits a given key's name  to new_name
    EDIT permission required on key.
    ---
    new_name:
      description: The new key name
      type: string
    key_id:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    params = params_from_request(request)
    new_name = params.get('new_name')
    if not new_name:
        raise RequiredParameterMissingError("new_name")

    auth_context = auth_context_from_request(request)
    try:
        key = Key.objects.get(owner=auth_context.owner,
                              id=key_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Key with that id does not exist')
    auth_context.check_perm('key', 'edit', key.id)
    key.ctl.rename(new_name)

    return {'new_name': new_name}


@view_config(route_name='api_v1_key_action', request_method='POST')
def set_default_key(request):
    """
    Set default key
    Sets a new default key
    EDIT permission required on key.
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']

    auth_context = auth_context_from_request(request)
    try:
        key = Key.objects.get(owner=auth_context.owner,
                              id=key_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'edit', key.id)

    key.ctl.set_default()
    return OK


@view_config(route_name='api_v1_key_private', request_method='GET',
             renderer='json')
def get_private_key(request):
    """
    Gets private key from key name.
    It is used in single key view when the user clicks the display private key
    button.
    READ_PRIVATE permission required on key.
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """

    key_id = request.matchdict['key']
    if not key_id:
        raise RequiredParameterMissingError("key_id")

    auth_context = auth_context_from_request(request)
    try:
        key = SSHKey.objects.get(owner=auth_context.owner,
                                 id=key_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'read_private', key.id)
    return key.private


@view_config(route_name='api_v1_key_public', request_method='GET',
             renderer='json')
def get_public_key(request):
    """
    Get public key
    Gets public key from key name.
    READ permission required on key.
    ---
    key:
      description: The key id
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    if not key_id:
        raise RequiredParameterMissingError("key_id")

    auth_context = auth_context_from_request(request)
    try:
        key = SSHKey.objects.get(owner=auth_context.owner,
                                 id=key_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Key id does not exist')

    auth_context.check_perm('key', 'read', key.id)
    return key.public


@view_config(route_name='api_v1_keys', request_method='POST', renderer='json')
@view_config(route_name='keys', request_method='POST', renderer='json')
def generate_key(request):
    """
    Generate key
    Generate key pair
    ---
    """
    key = SSHKey()
    key.ctl.generate()
    return {'priv': key.private, 'public': key.public}


@view_config(route_name='api_v1_key_association', request_method='PUT',
             renderer='json')
def associate_key(request):
    """
    Associate a key to a machine
    Associates a key with a machine. If host is set it will also attempt to
    actually deploy it to the machine. To do that it requires another key
    (existing_key) that can connect to the machine.
    READ permission required on cloud.
    READ_PRIVATE permission required on key.
    ASSOCIATE_KEY permission required on machine.
    ---
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    key:
      in: path
      required: true
      type: string
    port:
      default: 22
      type: integer
    user:
      description: The ssh user
      type: string
    """
    key_id = request.matchdict['key']
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']
    params = params_from_request(request)
    ssh_user = params.get('user', None)
    try:
        ssh_port = int(request.json_body.get('port', 22))
    except:
        ssh_port = 22

    auth_context = auth_context_from_request(request)

    try:
        cloud = Cloud.objects.get(owner=auth_context.owner,
                                  id=cloud_id, deleted=None)
    except Cloud.DoesNotExist:
        raise NotFoundError('Cloud does not exist')

    auth_context.check_perm("cloud", "read", cloud_id)
    key = Key.objects.get(owner=auth_context.owner, id=key_id, deleted=None)
    auth_context.check_perm('key', 'read_private', key.id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)

    auth_context.check_perm("machine", "associate_key", machine.id)

    key.ctl.associate(machine, username=ssh_user, port=ssh_port)
    clouds = Cloud.objects(owner=auth_context.owner, deleted=None)
    machines = Machine.objects(cloud__in=clouds,
                               key_associations__keypair__exact=key)

    assoc_machines = transform_key_machine_associations(machines, key)
    return assoc_machines


@view_config(route_name='api_v1_key_association', request_method='DELETE',
             renderer='json')
def disassociate_key(request):
    """
    Disassociate a key from a machine
    Disassociates a key from a machine. If host is set it will also attempt to
    actually remove it from the machine.
    READ permission required on cloud.
    DISASSOCIATE_KEY permission required on machine.
    ---
    key:
      in: path
      required: true
      type: string
    cloud:
      in: path
      required: true
      type: string
    machine:
      in: path
      required: true
      type: string
    """
    key_id = request.matchdict['key']
    cloud_id = request.matchdict['cloud']
    machine_id = request.matchdict['machine']

    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)
    auth_context.check_perm("machine", "disassociate_key", machine.id)

    key = Key.objects.get(owner=auth_context.owner, id=key_id, deleted=None)
    key.ctl.disassociate(machine)
    clouds = Cloud.objects(owner=auth_context.owner, deleted=None)
    machines = Machine.objects(cloud__in=clouds,
                               key_associations__keypair__exact=key)

    assoc_machines = transform_key_machine_associations(machines, key)
    return assoc_machines
