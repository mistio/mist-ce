from pyramid.config import Configurator
from mist.io.resources import Root
from mist.io.config import KEYPAIRS

def main(global_config, **settings):
    """This function returns a Pyramid WSGI application"""
    if not settings.keys():
        settings=global_config
    
    settings['keypairs'] = KEYPAIRS
    config = Configurator(root_factory=Root, settings=settings)
    config.add_static_view('static', 'mist.io:static')
    config.add_route('home', '/')
    config.add_route('machines', '/backends/{backend}/machines')
    config.add_route('machine', '/backends/{backend}/machines/{machine}')
    config.add_route('metadata', '/backends/{backend}/machines/{machine}/metadata')
    config.add_route('images', '/backends/{backend}/images')
    config.add_route('sizes', '/backends/{backend}/sizes')
    config.add_route('locations', '/backends/{backend}/locations')
    config.add_route('image_details', '/backends/{backend}/image_details')
    config.add_route('backends', '/backends')
    config.add_route('machine_has_key', '/backends/{backend}/machine_has_key')
    config.scan()
    return config.make_wsgi_app()
