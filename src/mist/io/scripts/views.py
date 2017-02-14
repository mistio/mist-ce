import uuid
import json
import mongoengine as me
from pyramid.response import Response

from mist.io import tasks

from mist.io.machines.models import Machine
from mist.io.scripts.models import Script, ExecutableScript
from mist.io.scripts.models import AnsibleScript, CollectdScript

from mist.io.auth.methods import auth_context_from_request

from mist.io.exceptions import RequiredParameterMissingError
from mist.io.exceptions import BadRequestError, NotFoundError
from mist.io.exceptions import PolicyUnauthorizedError, UnauthorizedError

from mist.io.helpers import get_stories
from mist.io.helpers import view_config, params_from_request

from mist.io.tag.methods import add_tags_to_resource, resolve_id_and_set_tags

OK = Response("OK", 200)


@view_config(route_name='api_v1_scripts', request_method='GET',
             renderer='json')
def list_scripts(request):
    """
    List user scripts
    READ permission required on each script.
    ---
    """
    auth_context = auth_context_from_request(request)
    scripts_list = mist.io.methods.filter_list_scripts(auth_context)
    return scripts_list


# SEC
@view_config(route_name='api_v1_scripts', request_method='POST',
             renderer='json')
def add_script(request):
    """
    Add script to user scripts
    ADD permission required on SCRIPT
    ---
    name:
      type: string
      required: true
    script:
      type: string
      required: false
    script_inline:
      type: string
      required: false
    script_github:
      type: string
      required: false
    script_url:
      type: string
      required: false
    location_type:
      type: string
      required: true
    entrypoint:
      type: string
    exec_type:
      type: string
      required: true
    description:
      type: string
    extra:
      type: dict
    """

    params = params_from_request(request)

    # SEC
    auth_context = auth_context_from_request(request)
    script_tags = auth_context.check_perm("script", "add", None)

    kwargs = {}

    for key in ('name', 'script', 'location_type', 'entrypoint', 'exec_type',
                'description', 'extra','script_inline', 'script_url',
                'script_github'):
        kwargs[key] = params.get(key)   # TODO maybe change this

    kwargs['script'] = choose_script_from_params(kwargs['location_type'],
                                                 kwargs['script'],
                                                 kwargs['script_inline'],
                                                 kwargs['script_url'],
                                                 kwargs['script_github'])
    for key in ('script_inline', 'script_url', 'script_github'):
        kwargs.pop(key)

    name = kwargs.pop('name')
    exec_type = kwargs.pop('exec_type')

    if exec_type == 'executable':
        script = ExecutableScript.add(auth_context.owner, name, **kwargs)
    elif exec_type == 'ansible':
        script = AnsibleScript.add(auth_context.owner, name, **kwargs)
    elif exec_type == 'collectd_python_plugin':
        script = CollectdScript.add(auth_context.owner, name, **kwargs)
    else:
        raise BadRequestError(
            "Param 'exec_type' must be in ('executable', 'ansible', "
            "'collectd_python_plugin')."
        )

    if script_tags:
        add_tags_to_resource(auth_context.owner, script, script_tags.items())

    script = script.as_dict_old()

    if 'job_id' in params:
        script['job_id'] = params['job_id']

    return script


# TODO this isn't nice
def choose_script_from_params(location_type, script,
                              script_inline, script_url,
                              script_github):
    if script != '' and script != None:
        return script

    if location_type == 'github':
        return script_github
    elif location_type == 'url':
        return script_url
    else:
        return script_inline


# SEC
@view_config(route_name='api_v1_script', request_method='GET', renderer='json')
def show_script(request):
    """
    Show script details and job history.
    READ permission required on script.
    ---
    script_id:
      type: string
      required: true
      in: path
    """
    script_id = request.matchdict['script_id']
    auth_context = auth_context_from_request(request)

    if not script_id:
        raise RequiredParameterMissingError('No script id provided')

    try:
        script = Script.objects.get(owner=auth_context.owner,
                                    id=script_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Script id not found')

    # SEC require READ permission on SCRIPT
    auth_context.check_perm('script', 'read', script_id)

    ret_dict = script.as_dict_old()
    jobs = get_stories('job', auth_context.owner.id, script_id=script_id)
    ret_dict['jobs'] = [job['job_id'] for job in jobs]
    return ret_dict


@view_config(route_name='api_v1_script_file', request_method='GET',
             renderer='json')
def download_script(request):
    """
    Download script file or archive.
    READ permission required on script.
    ---
    script_id:
      type: string
      required: true
      in: path
    """
    script_id = request.matchdict['script_id']
    auth_context = auth_context_from_request(request)

    if not script_id:
        raise RequiredParameterMissingError('No script id provided')

    try:
        script = Script.objects.get(owner=auth_context.owner,
                                    id=script_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Script id not found')

    # SEC require READ permission on SCRIPT
    auth_context.check_perm('script', 'read', script_id)
    try:
        return script.ctl.get_file()
    except BadRequestError():
        return Response("Unable to find: {}".format(request.path_info))


# SEC
@view_config(route_name='api_v1_script', request_method='DELETE',
             renderer='json')
def delete_script(request):
    """
    Delete script
    REMOVE permission required on script.
    ---
    script_id:
      in: path
      required: true
      type: string
    """
    script_id = request.matchdict['script_id']
    auth_context = auth_context_from_request(request)

    if not script_id:
        raise RequiredParameterMissingError('No script id provided')

    try:
        script = Script.objects.get(owner=auth_context.owner, id=script_id,
                                    deleted=None)

    except me.DoesNotExist:
        raise NotFoundError('Script id not found')

    # SEC require REMOVE permission on script
    auth_context.check_perm('script', 'remove', script_id)

    script.ctl.delete()
    return OK


# SEC
@view_config(route_name='api_v1_scripts',
             request_method='DELETE', renderer='json')
def delete_scripts(request):
    """
    Delete multiple scripts.
    Provide a list of script ids to be deleted. The method will try to delete
    all of them and then return a json that describes for each script id
    whether or not it was deleted or the not_found if the script id could not
    be located. If no script id was found then a 404(Not Found) response will
    be returned.
    REMOVE permission required on each script.
    ---
    script_ids:
      required: true
      type: array
      items:
        type: string
        name: script_id
    """
    auth_context = auth_context_from_request(request)
    params = params_from_request(request)
    script_ids = params.get('script_ids', [])
    if type(script_ids) != list or len(script_ids) == 0:
        raise RequiredParameterMissingError('No script ids provided')

    # remove duplicate ids if there are any
    script_ids = sorted(script_ids)
    i = 1
    while i < len(script_ids):
        if script_ids[i] == script_ids[i - 1]:
            script_ids = script_ids[:i] + script_ids[i + 1:]
        else:
            i += 1

    report = {}
    for script_id in script_ids:
        try:
            script = Script.objects.get(owner=auth_context.owner,
                                        id=script_id, deleted=None)
        except me.DoesNotExist:
            report[script_id] = 'not_found'
            continue
        # SEC require REMOVE permission on script
        try:
            auth_context.check_perm('script', 'remove', script_id)
        except PolicyUnauthorizedError:
            report[script_id] = 'unauthorized'
        else:
            script.ctl.delete()
            report[script_id] = 'deleted'
        # /SEC

    # if no script id was valid raise exception
    if len(filter(lambda script_id: report[script_id] == 'not_found',
                  report)) == len(script_ids):
        raise NotFoundError('No valid script id provided')
    # if user was not authorized for any script raise exception
    if len(filter(lambda script_id: report[script_id] == 'unauthorized',
                  report)) == len(script_ids):
        raise UnauthorizedError("You don't have authorization for any of these"
                                " scripts")
    return report


# SEC
@view_config(route_name='api_v1_script', request_method='PUT', renderer='json')
def edit_script(request):
    """
    Edit script (rename only as for now)
    EDIT permission required on script.
    ---
    script_id:
      in: path
      required: true
      type: string
    new_name:
      type: string
      required: true
    new_description:
      type: string
    """
    script_id = request.matchdict['script_id']
    params = params_from_request(request)
    new_name = params.get('new_name')
    new_description = params.get('new_description')

    auth_context = auth_context_from_request(request)
    # SEC require EDIT permission on script
    auth_context.check_perm('script', 'edit', script_id)
    try:
        script = Script.objects.get(owner=auth_context.owner,
                                    id=script_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Script id not found')

    if not new_name:
        raise RequiredParameterMissingError('No new name provided')

    script.ctl.edit(new_name, new_description)
    ret = {'new_name': new_name}
    if isinstance(new_description, basestring):
        ret['new_description'] = new_description
    return ret


# SEC
@view_config(route_name='api_v1_script', request_method='POST',
             renderer='json')
def run_script(request):
    """
    Start a script job to run the script.
    READ permission required on cloud.
    RUN_SCRIPT permission required on machine.
    RUN permission required on script.
    ---
    script_id:
      in: path
      required: true
      type: string
    cloud_id:
      required: true
      type: string
    machine_id:
      required: true
      type: string
    params:
      type: string
    su:
      type: boolean
    env:
      type: string
    job_id:
      type: string
    """
    script_id = request.matchdict['script_id']
    params = params_from_request(request)
    cloud_id = params['cloud_id']
    machine_id = params['machine_id']
    script_params = params.get('params', '')
    su = params.get('su', False)
    env = params.get('env')
    job_id = params.get('job_id')
    if isinstance(env, dict):
        env = json.dumps(env)
    for key in ('cloud_id', 'machine_id'):
        if key not in params:
            raise RequiredParameterMissingError(key)
    auth_context = auth_context_from_request(request)
    auth_context.check_perm("cloud", "read", cloud_id)
    try:
        machine = Machine.objects.get(cloud=cloud_id, machine_id=machine_id)
    except me.DoesNotExist:
        raise NotFoundError("Machine %s doesn't exist" % machine_id)

    # SEC require permission RUN_SCRIPT on machine
    auth_context.check_perm("machine", "run_script", machine.id)
    # SEC require permission RUN on script
    auth_context.check_perm('script', 'run', script_id)
    try:
        script = Script.objects.get(owner=auth_context.owner,
                                    id=script_id, deleted=None)
    except me.DoesNotExist:
        raise NotFoundError('Script id not found')
    job_id = job_id or uuid.uuid4().hex
    tasks.run_script.delay(auth_context.owner.id, script.id,
                           cloud_id, machine_id, params=script_params,
                           env=env, su=su, job_id=job_id)
    return {'job_id': job_id}