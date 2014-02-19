"""Routes and wsgi app creation"""


import yaml
import logging
import os
import json
import requests


from pyramid.config import Configurator
from pyramid.renderers import JSON

from mist.io.resources import Root
import mist.io.config


log = logging.getLogger(__name__)


def main(global_config, **settings):
    """This function returns a Pyramid WSGI application."""
    if not settings.keys():
        settings = global_config

    settings = {}
    from mist.io.model import User

    # migrate settings.yaml to db.yaml
    try:
        with open('settings.yaml', 'r') as config_file:
            log.info("Found settings.yaml, migrating...")
            data = config_file.read()
            with open('db.yaml', 'w') as db_file:
                db_file.write(data)
        os.rename('settings.yaml', 'settings.yaml.backup')
        user = User()
        with user.lock_n_load():
            for key in ['core_uri', 'js_build', 'js_log_level']:
                if key in user._dict:
                    del user._dict[key]
            user.save()

        from mist.io.model import Machine
        with user.lock_n_load():
            for backend in user.backends.values():
                if 'list_of_machines' in backend._dict:
                    list_of_machines = backend._dict['list_of_machines']
                    for old_machine in list_of_machines:
                        machine_id = old_machine.get('id')
                        machine_hostname = old_machine.get('hostname')
                        print ("Migrating %s(%s) for user %s" %
                               (machine_id, machine_hostname, user.email))
                        if not machine_id or not machine_hostname:
                            print " *** ERROR MIGRATING, SKIPPING *** "
                            continue
                        if machine_id not in backend.machines:
                            backend.machines[machine_id] = Machine()
                        machine = backend.machines[machine_id]
                        machine.dns_name = machine_hostname
                        machine.public_ips.append(machine_hostname)
                        machine.name = machine_hostname
                    del backend._dict['list_of_machines']
            user.save()
    except IOError as exc:
        # settings.yaml doesn't exist, continue
        pass

    ## user = User()   # this automatically loads from db.yaml
    ## # try to authenticate with mist.io service if email,password are available
    ## if user.email and user.mist_api_token:
        ## from mist.io.helpers import get_auth_header
        ## try:
            ## ret = requests.post(mist.io.config.CORE_URI + '/auth',
                                ## headers={'Authorization': get_auth_header(user)},
                                ## verify=mist.io.config.SSL_VERIFY)
        ## except requests.exceptions.SSLError as exc:
            ## log.error("SSL Error when communicating with %s: %s",
                      ## mist.io.config.CORE_URI, exc)
        ## else:
            ## if ret.status_code == 200:
                ## log.info("Succesfully authenticated to mist.io service.")
                ## ret = json.loads(ret.content)
                ## # all these are no longer used. Also settings is not a safe
                # place to put info since it's worker dependant
                ## settings['current_plan'] = ret.get('current_plan', {})
                ## # FIXME: do we really need the following params?
                ## user_details = ret.get('user_details', {})
                ## settings['user']['name'] = user_details.get('name', '')
                ## settings['user']['company_name'] = user_details.get('company_name', '')
                ## settings['user']['country'] = user_details.get('country', '')
                ## settings['user']['number_of_servers'] = user_details.get('number_of_servers', '')
                ## settings['user']['number_of_people'] = user_details.get('number_of_people', '')
            ## else:
                ## log.error("Error authenticating to mist.io service. %d: %s", ret.status_code, ret.text)

    config = Configurator(root_factory=Root, settings=settings)

    # Add custom adapter to the JSON renderer to avoid serialization errors
    json_renderer = JSON()
    def string_adapter(obj, request):
        return str(obj)
    json_renderer.add_adapter(object, string_adapter)
    config.add_renderer('json', json_renderer)    
    config.add_static_view('resources', 'mist.io:static')
    config.add_static_view('docs', path='../../../docs/build')
    config.include(add_routes)
    config.scan()
    app = config.make_wsgi_app()

    return app


def add_routes(config):
    """This function defines pyramid routes.

    Takes a Configurator instance as argument and changes it's configuration.
    Any return value is ignored. This was put in a separate function so that it
    can easily be imported and extended upon.
    Just use: config.include(add_routes)

    """

    config.add_route('home', '/')
    config.add_route('providers', '/providers')
    config.add_route('backends', '/backends')
    config.add_route('backend_action', '/backends/{backend}')

    config.add_route('machines', '/backends/{backend}/machines')
    config.add_route('machine', '/backends/{backend}/machines/{machine}')
    config.add_route('machine_metadata',
                     '/backends/{backend}/machines/{machine}/metadata')
    config.add_route('probe', '/backends/{backend}/machines/{machine}/probe')
    config.add_route('shell', '/backends/{backend}/machines/{machine}/shell')

    config.add_route('monitoring', '/monitoring')
    config.add_route('update_monitoring',
                     '/backends/{backend}/machines/{machine}/monitoring')
    config.add_route('stats', '/backends/{backend}/machines/{machine}/stats')
    config.add_route('loadavg',
                     '/backends/{backend}/machines/{machine}/loadavg.png')

    config.add_route('images', '/backends/{backend}/images')
    config.add_route('image', '/backends/{backend}/images/{image}')
    config.add_route('sizes', '/backends/{backend}/sizes')
    config.add_route('locations', '/backends/{backend}/locations')

    config.add_route('keys', '/keys')
    config.add_route('key_action', '/keys/{key}')
    config.add_route('key_public', '/keys/{key}/public')
    config.add_route('key_private', 'keys/{key}/private')
    config.add_route('key_association',
                     '/backends/{backend}/machines/{machine}/keys/{key}')

    config.add_route('rules', '/rules')
    config.add_route('rule', '/rules/{rule}')
    config.add_route('check_auth', '/auth')
    config.add_route('account', '/account')
