from pyramid.config import Configurator
from mist.io.resources import Root

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(root_factory=Root, settings=settings)
    config.add_static_view('static', 'unweb.cloud:static')
    config.add_route('home', '/',
                     view='mist.io.views.home',
                     view_renderer='templates/home.pt')

    config.add_route('machines', '/machines',
                     view='mist.io.views.machines',
                     view_renderer='templates/machines.pt')

    config.add_route('disks', '/disks',
                     view='mist.io.views.disks',
                     view_renderer='templates/disks.pt')

    config.add_route('images', '/images',
                     view='mist.io.views.images',
                     view_renderer='templates/images.pt')

    config.add_route('networks', '/networks',
                     view='mist.io.views.network',
                     view_renderer='templates/network.pt')
    return config.make_wsgi_app()

