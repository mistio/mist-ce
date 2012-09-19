"""Routes and create the wsgi app"""
from libcloud.compute.types import Provider

from pyramid.config import Configurator

from mist.io.resources import Root
from mist.io.cors import CORSMiddleware


def main(global_config, **settings):
    """This function returns a Pyramid WSGI application"""
    if not settings.keys():
        settings = global_config

    # import BACKENDS and KEYPAIRS from config
    user_config = {}
    execfile(global_config['here'] + '/settings.py',
            {'Provider':Provider},
            user_config)

    settings['keypairs'] = user_config['KEYPAIRS']
    settings['backends'] = user_config['BACKENDS']

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
    config.add_route('image_metadata',
                     '/backends/{backend}/images/{image}/metadata')

    config.add_route('sizes', '/backends/{backend}/sizes')

    config.add_route('locations', '/backends/{backend}/locations')

    config.scan()

    #app = CORSMiddleware(config.make_wsgi_app())
    app = config.make_wsgi_app()
    return app
