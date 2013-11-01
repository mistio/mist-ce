"""Routes and wsgi app creation"""
import yaml
import logging
import os
import json

import requests

from pyramid.config import Configurator

from mist.io.resources import Root
from mist.io import helpers
from mist.io.shell import ShellMiddleware

log = logging.getLogger('mist.io')


def main(global_config, **settings):
    """This function returns a Pyramid WSGI application."""
    if not settings.keys():
        settings = global_config

    # Import settings using sensible defaults where applicable
    #OLD
    #helpers.load_settings(settings)

    ##------------------CHAOS COMMENT-------------
    #We used to call helpers.load_settings(settings) in order
    #to load everything, from user details to general settings
    #like core uri etc. User specific settings get initialized
    #in dal.py _load_from_settings.
    #---------------------------------------------
    yaml_settings = os.getcwd() + "/settings.yaml"
    try:
        config_file = open(yaml_settings, 'r')
    except IOError:
        log.warn('settings.yaml does not exist.')
        config_file = open(yaml_settings, 'w')
        config_file.close()
        config_file = open(yaml_settings, 'r')

    try:
        config = yaml.load(config_file) or {}
        config_file.close()
    except:
        log.error('Error parsing settings.yaml')
        config_file.close()
        raise

    settings = {}
    settings['js_build'] = config.get('js_build', settings.get('js_build', True))
    settings['js_log_level'] = config.get('js_log_level', 3)
    settings['default_poll_interval'] = config.get('default_poll_interval',
                                                         10000)
    settings['core_uri'] = config.get('core_uri', 'http://mist.io')
    settings['google_analytics_id'] = config.get('google_analytics_id', '')

    ## try to authenticate with mist.io service if email & password are available
    #OLD
    #if settings['user'].get('email') and settings['user'].get('password'):
    #    payload = {'email': settings['user'].get('email'),
    #               'password': settings['user'].get('password')}
    #    ret = requests.post(settings['core_uri'] + '/auth', params=payload, verify=False)
    #    if ret.status_code == 200:
    #        settings['auth'] = 1
    #        ret = json.loads(ret.content)
    #        settings['current_plan'] = ret.get('current_plan',{})
    #        settings['auth_key'] = ret.get('auth_key', '')
    #        user_details = ret.get('user_details', {})
    #        settings['user']['name'] = user_details.get('name', '')
    #        settings['user']['company_name'] = user_details.get('company_name', '')
    #        settings['user']['country'] = user_details.get('country', '')
    #        settings['user']['number_of_servers'] = user_details.get('number_of_servers', '')
    #        settings['user']['number_of_people'] = user_details.get('number_of_people', '')
    #    else:
    #        settings['auth'] = 0

    config = Configurator(root_factory=Root, settings=settings)

    config.add_static_view('resources', 'mist.io:static')

    config.add_route('home', '/')
    config.add_route('backends', '/backends')
    config.add_route('backend_action', '/backends/{backend}')

    config.add_route('machines', '/backends/{backend}/machines')
    config.add_route('machine', '/backends/{backend}/machines/{machine}')
    config.add_route('machine_metadata', '/backends/{backend}/machines/{machine}/metadata')
    config.add_route('probe', '/backends/{backend}/machines/{machine}/probe')
    config.add_route('shell', '/backends/{backend}/machines/{machine}/shell')

    config.add_route('monitoring', '/monitoring')
    config.add_route('update_monitoring', '/backends/{backend}/machines/{machine}/monitoring')

    config.add_route('images', '/backends/{backend}/images')
    config.add_route('image', '/backends/{backend}/images/{image}')
    config.add_route('sizes', '/backends/{backend}/sizes')
    config.add_route('locations', '/backends/{backend}/locations')
    
    config.add_route('keys', '/keys')
    config.add_route('key_action', '/keys/{key}')
    config.add_route('key_association', '/backends/{backend}/machines/{machine}/keys/{key}')
    
    config.add_route('rules', '/rules')
    config.add_route('rule', '/rules/{rule}')
    config.add_route('check_auth', '/auth')
    config.add_route('account', '/account')
    
    config.scan()
    
    app = config.make_wsgi_app()
    app = ShellMiddleware(app)

    return app
