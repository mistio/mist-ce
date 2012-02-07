from pyramid.config import Configurator
from mist.io.resources import Root

def main(global_config, **settings):
    """This function returns a Pyramid WSGI application"""
    config = Configurator(root_factory=Root, settings=settings)

    config.add_static_view('static', 'mist.io:static')
    config.add_route('home', '/')
    config.add_route('machines', '/backends/{backend}/machines')
    config.add_route('machine', '/backends/{backend}/machines/{machine}')
    config.add_route('metadata', '/backends/{backend}/machines/{machine}/metadata')
    config.add_route('images', '/backends/{backend}/images')
    config.add_route('sizes', '/backends/{backend}/sizes')
    config.add_route('locations', '/backends/{backend}/locations')

    config.scan()
    return config.make_wsgi_app()
