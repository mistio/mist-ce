"""Routes and wsgi app creation"""

import os

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
    settings = {}

    configurator = Configurator(root_factory=Root, settings=settings)

    # Add custom adapter to the JSON renderer to avoid serialization errors
    json_renderer = JSON()

    def string_adapter(obj, request):
        return str(obj)

    json_renderer.add_adapter(object, string_adapter)
    configurator.add_renderer('json', json_renderer)
    configurator.add_static_view('resources', 'mist.io:static')
    configurator.add_static_view('docs', path='../../../docs/build')

    # polymer resources
    configurator.add_static_view('bower_components', path='../../../bower_components')
    configurator.add_static_view('elements', path='../../../app/elements')
    configurator.add_static_view('images', path='../../../app/images')
    configurator.add_static_view('styles', path='../../../app/styles')

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
    configurator.add_route('machines', '/machines')
    configurator.add_route('networks', '/networks')
    configurator.add_route('keys', '/keys')
    configurator.add_route('key', '/keys/{key}')
    configurator.add_route('machine', '/machines/{machine}')
    configurator.add_route('images', '/images')
    configurator.add_route('image', '/images/{image}')


    configurator.add_route('api_v1_providers', '/api/v1/providers')
    configurator.add_route('providers', '/providers')
    configurator.add_route('api_v1_clouds', '/api/v1/clouds')
    configurator.add_route('clouds', '/clouds')
    configurator.add_route('api_v1_cloud_action', '/api/v1/clouds/{cloud}')
    configurator.add_route('cloud_action', '/clouds/{cloud}')

    configurator.add_route('api_v1_machines', '/api/v1/clouds/{cloud}/machines')
    configurator.add_route('api_v1_machine',
                           '/api/v1/clouds/{cloud}/machines/{machine}')
    configurator.add_route('api_v1_machine_rdp',
                           '/api/v1/clouds/{cloud}/machines/{machine}/rdp')
    configurator.add_route('api_v1_machine_tags',
                           '/api/v1/clouds/{cloud}/machines/{machine}/tags')
    configurator.add_route('api_v1_machine_tag',
                           '/api/v1/clouds/{cloud}/machines/{machine}/tags/{tag}')
    configurator.add_route('api_v1_tags', '/api/v1/tags')
    configurator.add_route('api_v1_probe',
                           '/api/v1/clouds/{cloud}/machines/{machine}/probe')

    configurator.add_route('api_v1_monitoring', '/api/v1/monitoring')
    configurator.add_route('monitoring', '/monitoring')
    configurator.add_route('api_v1_update_monitoring',
                           '/api/v1/clouds/{cloud}/machines/{machine}/monitoring')
    configurator.add_route('update_monitoring',
                           '/clouds/{cloud}/machines/{machine}/monitoring')
    configurator.add_route('api_v1_stats',
                           '/api/v1/clouds/{cloud}/machines/{machine}/stats')
    configurator.add_route('stats', '/clouds/{cloud}/machines/{machine}/stats')
    configurator.add_route('api_v1_metrics',
                           '/api/v1/clouds/{cloud}/machines/{machine}/metrics')
    configurator.add_route('metrics',
                           '/clouds/{cloud}/machines/{machine}/metrics')
    configurator.add_route('api_v1_metric', '/api/v1/metrics/{metric}')
    configurator.add_route('metric', '/metrics/{metric}')
    configurator.add_route('api_v1_deploy_plugin',
                           '/api/v1/clouds/{cloud}/machines/{machine}/plugins/{plugin}')
    configurator.add_route('deploy_plugin',
                           '/clouds/{cloud}/machines/{machine}/plugins/{plugin}')

    configurator.add_route('api_v1_images', '/api/v1/clouds/{cloud}/images')
    configurator.add_route('api_v1_image',
                           '/api/v1/clouds/{cloud}/images/{image:.*}')
    configurator.add_route('api_v1_sizes', '/api/v1/clouds/{cloud}/sizes')
    configurator.add_route('api_v1_locations',
                           '/api/v1/clouds/{cloud}/locations')
    configurator.add_route('api_v1_networks', '/api/v1/clouds/{cloud}/networks')
    configurator.add_route('api_v1_network',
                           '/api/v1/clouds/{cloud}/networks/{network}')
    configurator.add_route('network', '/clouds/{cloud}/networks/{network}')

    configurator.add_route('api_v1_keys', '/api/v1/keys')
    configurator.add_route('api_v1_key_action', '/api/v1/keys/{key}')
    configurator.add_route('key_action', '/keys/{key}')
    configurator.add_route('api_v1_key_public', '/api/v1/keys/{key}/public')
    configurator.add_route('key_public', '/keys/{key}/public')
    configurator.add_route('api_v1_key_private', '/api/v1/keys/{key}/private')
    configurator.add_route('key_private', '/keys/{key}/private')
    configurator.add_route('api_v1_key_association',
                           '/api/v1/clouds/{cloud}/machines/{machine}/keys/{key}')
    configurator.add_route('key_association',
                           '/clouds/{cloud}/machines/{machine}/keys/{key}')

    configurator.add_route('api_v1_rules', '/api/v1/rules')
    configurator.add_route('rules', '/rules')
    configurator.add_route('api_v1_rule', '/api/v1/rules/{rule}')
    configurator.add_route('rule', '/rules/{rule}')
    configurator.add_route('api_v1_check_auth', '/api/v1/auth')
    configurator.add_route('check_auth', '/auth')
    configurator.add_route('account', '/account')
