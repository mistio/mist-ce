"""Routes and create the wsgi app"""
import yaml
import logging

from pyramid.config import Configurator

from mist.io.resources import Root
from mist.io import helpers
from mist.io.shell import ShellMiddleware

log = logging.getLogger('mist.io')


def main(global_config, **settings):
    """This function returns a Pyramid WSGI application"""
    if not settings.keys():
        settings = global_config

    # Import settings using sensible defaults where applicable
    helpers.load_settings(settings)

    config = Configurator(root_factory=Root, settings=settings)

    config.add_static_view('static', 'mist.io:static')

    config.add_route('home', '/')
    config.add_route('backends', '/backends')
    config.add_route('backend_action', '/backends/{backend}')

    config.add_route('machines', '/backends/{backend}/machines')
    config.add_route('machine', '/backends/{backend}/machines/{machine}')
    config.add_route('machine_metadata',
                     '/backends/{backend}/machines/{machine}/metadata')
    config.add_route('machine_shell',
                     '/backends/{backend}/machines/{machine}/shell')

    config.add_route('images', '/backends/{backend}/images')
    config.add_route('sizes', '/backends/{backend}/sizes')
    config.add_route('locations', '/backends/{backend}/locations')
    config.add_route('keys', '/keys')
    config.add_route('key', '/keys/{key}')
    config.add_route('monitoring', '/backends/{backend}/machines/{machine}/monitoring')

    config.scan()

    app = config.make_wsgi_app()
    
    app = ShellMiddleware(app)
    return app
