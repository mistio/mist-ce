"""Routes and create the wsgi app"""
from logging import getLogger
from libcloud.compute.types import Provider

from pyramid.config import Configurator

from mist.io.resources import Root

log = getLogger('mist.io')


def main(global_config, **settings):
    """This function returns a Pyramid WSGI application"""
    if not settings.keys():
        settings = global_config

    # Import settings using sensible defaults where applicable
    try:
        user_config = {}
        execfile(global_config['here'] + '/settings.py',
                {'Provider':Provider},
                user_config)
        settings['keypairs'] = user_config['KEYPAIRS']
        settings['backends'] = user_config['BACKENDS']
        settings['core_uri'] = user_config.get('CORE_URI', 'https://mist.io')
        settings['js_build'] = user_config.get('JS_BUILD', False)
        settings['js_log_level'] = user_config.get('JS_LOG_LEVEL', 3)
    except:
        log.warn('Local settings.py not available.')

    config = Configurator(root_factory=Root, settings=settings)

    config.add_static_view('static', 'mist.io:static')

    config.add_route('home', '/')
    config.add_route('backends', '/backends')

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

    config.scan()

    app = config.make_wsgi_app()
    return app
