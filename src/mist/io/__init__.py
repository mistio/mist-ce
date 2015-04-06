"""Routes and wsgi app creation"""

import yaml
import os
import json
import requests

from pyramid.config import Configurator
from pyramid.renderers import JSON

from mist.io.resources import Root
from mist.io import config

import logging
logging.basicConfig(level=config.PY_LOG_LEVEL,
                    format=config.PY_LOG_FORMAT,
                    datefmt=config.PY_LOG_FORMAT_DATE)
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


    configurator = Configurator(root_factory=Root, settings=settings)

    # Add custom adapter to the JSON renderer to avoid serialization errors
    json_renderer = JSON()
    def string_adapter(obj, request):
        return str(obj)
    json_renderer.add_adapter(object, string_adapter)
    configurator.add_renderer('json', json_renderer)
    configurator.add_static_view('resources', 'mist.io:static')
    configurator.add_static_view('docs', path='../../../docs/build')
    configurator.include(add_routes)
    configurator.scan()
    app = configurator.make_wsgi_app()

    return app


def add_routes(configurator):
    """This function defines pyramid routes.

    Takes a Configurator instance as argument and changes it's configuration.
    Any return value is ignored. This was put in a separate function so that it
    can easily be imported and extended upon.
    Just use: config.include(add_routes)

    """

    configurator.add_route('home', '/')
    configurator.add_route('providers', '/providers')
    configurator.add_route('backends', '/backends')
    configurator.add_route('backend_action', '/backends/{backend}')

    configurator.add_route('machines', '/backends/{backend}/machines')
    configurator.add_route('machine', '/backends/{backend}/machines/{machine}')
    configurator.add_route('machine_rdp', '/backends/{backend}/machines/{machine}/rdp')
    configurator.add_route('machine_metadata',
                     '/backends/{backend}/machines/{machine}/metadata')
    configurator.add_route('probe', '/backends/{backend}/machines/{machine}/probe')

    configurator.add_route('monitoring', '/monitoring')
    configurator.add_route('update_monitoring',
                     '/backends/{backend}/machines/{machine}/monitoring')
    configurator.add_route('stats', '/backends/{backend}/machines/{machine}/stats')
    configurator.add_route('metrics',
                     '/backends/{backend}/machines/{machine}/metrics')
    configurator.add_route('metric', '/metrics/{metric}')
    configurator.add_route('deploy_plugin',
                     '/backends/{backend}/machines/{machine}/plugins/{plugin}')

    configurator.add_route('images', '/backends/{backend}/images')
    configurator.add_route('image', '/backends/{backend}/images/{image:.*}')
    configurator.add_route('sizes', '/backends/{backend}/sizes')
    configurator.add_route('locations', '/backends/{backend}/locations')
    configurator.add_route('networks', '/backends/{backend}/networks')
    configurator.add_route('network', '/backends/{backend}/networks/{network}')

    configurator.add_route('keys', '/keys')
    configurator.add_route('key_action', '/keys/{key}')
    configurator.add_route('key_public', '/keys/{key}/public')
    configurator.add_route('key_private', 'keys/{key}/private')
    configurator.add_route('key_association',
                           '/backends/{backend}/machines/{machine}/keys/{key}')

    configurator.add_route('rules', '/rules')
    configurator.add_route('rule', '/rules/{rule}')
    configurator.add_route('check_auth', '/auth')
    configurator.add_route('account', '/account')

    configurator.add_route('socketio', '/socket.io/*remaining')
