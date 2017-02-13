from pyramid.config import Configurator
from pyramid.renderers import JSON


def main(global_config, **settings):
    """This function returns a Pyramid WSGI application."""
    settings = {}

    configurator = Configurator(settings)

    # Add custom adapter to the JSON renderer to avoid serialization errors
    json_renderer = JSON()

    def string_adapter(obj, request):
        return str(obj)

    json_renderer.add_adapter(object, string_adapter)
    configurator.add_renderer('json', json_renderer)

    configurator.include(add_routes)
    configurator.scan()
    app = configurator.make_wsgi_app()

    return app


def add_routes(configurator):
    configurator.add_route('api_v1_tags', '/api/v1/tags')
    configurator.add_route('key_tags', '/keys/{key_id}/tags')
    configurator.add_route('cloud_tags', '/clouds/{cloud_id}/tags')
    configurator.add_route('script_tags', '/scripts/{script_id}/tags')
    configurator.add_route('schedule_tags', '/schedules/{schedule_id}/tags')
    configurator.add_route('network_tags','/clouds/{cloud_id}/networks/{network_id}/tags')
    configurator.add_route('api_v1_machine_tags','/api/v1/clouds/{cloud_id}/machines/{machine_id}/tags')

    configurator.add_route('key_tag', '/keys/{key_id}/tag')
    configurator.add_route('cloud_tag', '/clouds/{cloud_id}/tag')
    configurator.add_route('script_tag', '/scripts/{script_id}/tag')
    configurator.add_route('schedule_tag', '/schedules/{schedule_id}/tag')
    configurator.add_route('machine_tag',
                           '/clouds/{cloud_id}/machines/{machine_id}/tag')
    configurator.add_route('network_tag', '/clouds/{cloud}/networks/{network_id}/tag/{tag_key}')

    configurator.add_route('api_v1_machine_tag',
        '/api/v2/clouds/{cloud_id}/machines/{machine_id}/tags/{tag_key}'
    )
