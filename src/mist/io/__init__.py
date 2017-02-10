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
    configurator.add_static_view('src', path='../../../ui/src')
    configurator.add_static_view('assets', path='../../../ui/assets')

    configurator.add_static_view('docs', path='../../../docs/build')

    # polymer resources
    configurator.add_static_view('bower_components', path='../../../ui/bower_components')

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
    configurator.add_route('clouds', '/clouds')
    configurator.add_route('cloud', '/clouds/{cloud}')
    configurator.add_route('machines', '/machines')
    configurator.add_route('machine', '/machines/{machine}')
    configurator.add_route('networks', '/networks')
    configurator.add_route('network', '/networks/{network}')
    configurator.add_route('keys', '/keys')
    configurator.add_route('key', '/keys/{key}')
    configurator.add_route('images', '/images')
    configurator.add_route('image', '/images/{image}')

    configurator.add_route('api_v1_providers', '/api/v1/providers')
    configurator.add_route('api_v1_clouds', '/api/v1/clouds')
    configurator.add_route('api_v1_cloud_action', '/api/v1/clouds/{cloud}')

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
    configurator.add_route('api_v1_update_monitoring',
                           '/api/v1/clouds/{cloud}/machines/{machine}/monitoring')
    configurator.add_route('api_v1_stats',
                           '/api/v1/clouds/{cloud}/machines/{machine}/stats')
    configurator.add_route('api_v1_metrics',
                           '/api/v1/clouds/{cloud}/machines/{machine}/metrics')
    configurator.add_route('api_v1_metric', '/api/v1/metrics/{metric}')
    configurator.add_route('api_v1_deploy_plugin',
                           '/api/v1/clouds/{cloud}/machines/{machine}/plugins/{plugin}')

    configurator.add_route('api_v1_images', '/api/v1/clouds/{cloud}/images')
    configurator.add_route('api_v1_image',
                           '/api/v1/clouds/{cloud}/images/{image:.*}')
    configurator.add_route('api_v1_sizes', '/api/v1/clouds/{cloud}/sizes')
    configurator.add_route('api_v1_locations',
                           '/api/v1/clouds/{cloud}/locations')
    configurator.add_route('api_v1_networks', '/api/v1/clouds/{cloud}/networks')
    configurator.add_route('api_v1_network',
                           '/api/v1/clouds/{cloud}/networks/{network}')

    configurator.add_route('api_v1_keys', '/api/v1/keys')
    configurator.add_route('api_v1_key_action', '/api/v1/keys/{key}')
    configurator.add_route('api_v1_key_public', '/api/v1/keys/{key}/public')
    configurator.add_route('api_v1_key_private', '/api/v1/keys/{key}/private')
    configurator.add_route('api_v1_key_association',
                           '/api/v1/clouds/{cloud}/machines/{machine}/keys/{key}')

    configurator.add_route('api_v1_rules', '/api/v1/rules')
    configurator.add_route('api_v1_rule', '/api/v1/rules/{rule}')
    configurator.add_route('api_v1_check_auth', '/api/v1/auth')

    configurator.add_route('api_v1_zones',
                           '/api/v1/clouds/{cloud}/dns/zones')
    configurator.add_route('api_v1_zone',
                           '/api/v1/clouds/{cloud}/dns/zones/{zone}')
    configurator.add_route('api_v1_records',
                           '/api/v1/clouds/{cloud}/dns/zones/{zone}/records')
    configurator.add_route('api_v1_record',
                           '/api/v1/clouds/{cloud}/dns/zones/{zone}/records/{record}')

    configurator.add_route('api_v1_ping', '/api/v1/ping')
    configurator.add_route('api_v1_tokens', '/api/v1/tokens')
    configurator.add_route('api_v1_sessions', '/api/v1/sessions')

    configurator.add_route('api_v1_scripts', '/api/v1/scripts')
    configurator.add_route('api_v1_script', '/api/v1/scripts/{script_id}')
    configurator.add_route('api_v1_script_file', '/api/v1/scripts/{script_id}/file')

    configurator.add_route('api_v1_schedules', '/api/v1/schedules')
    configurator.add_route('api_v1_schedule', '/api/v1/schedules/{schedule_id}')

    configurator.add_route('api_v1_orgs', '/api/v1/orgs')
    configurator.add_route('api_v1_org', '/api/v1/org')
    configurator.add_route('api_v1_org_info', '/api/v1/org/{org_id}')

    configurator.add_route('api_v1_teams', '/api/v1/org/{org_id}/teams')
    configurator.add_route('api_v1_team', '/api/v1/org/{org_id}/teams/{team_id}')

    configurator.add_route('api_v1_members', '/api/v1/org/{org_name}/members')
    configurator.add_route('api_v1_member', '/api/v1/org/{org_name}/members/{user_id}')

    configurator.add_route('api_v1_team_members', '/api/v1/org/{org_id}/teams/{team_id}/members')
    configurator.add_route('api_v1_team_member', '/api/v1/org/{org_id}/teams/{team_id}/members/{user_id}')

    configurator.add_route('switch_context', '/switch_context')
    configurator.add_route('switch_context_org', '/switch_context/{org_id}')
    configurator.add_route('login', '/login')
    configurator.add_route('login_service', 'login/{service}')
    configurator.add_route('logout', '/logout')
    configurator.add_route('register', '/register')
    configurator.add_route('confirm', '/confirm')
    configurator.add_route('confirm_invitation', '/confirm_invitation')
    configurator.add_route('set_password', '/set_password')
    configurator.add_route('forgot_password', '/forgot')
    configurator.add_route('reset_password', '/reset_password')
    configurator.add_route('invitation', '/invitation')
    configurator.add_route('user_invitations', '/user_invitations')
