from pyramid.config import Configurator
from mist.io.resources import Root

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(root_factory=Root, settings=settings)

    config.add_static_view('static', 'mist.io:static')

    config.add_route('home', '/')
    config.add_view('mist.io.views.home', 
                    route_name='home', 
                    renderer='templates/home.pt')

    config.add_route('machines', '/machines')
    config.add_view('mist.io.views.machines',
                    route_name='machines',
                    renderer='templates/machines.pt')

    config.add_route('disks', '/disks')
    config.add_view('mist.io.views.disks',
                    route_name='disks',
                    renderer='templates/disks.pt')

    config.add_route('images', '/images')
    config.add_view('mist.io.views.images',
                    route_name='images',
                    renderer='templates/images.pt')

    config.add_route('networks', '/networks')
    config.add_view('mist.io.views.networks',
                    route_name='networks',
                    renderer='templates/network.pt')
    
    config.add_route('backends', '/backends/{backend}/machines/list')
    config.add_view('mist.io.views.list_machines',
                    route_name='backends')

    config.add_route('start', '/backends/{backend}/machines/start')
    config.add_view('mist.io.views.start_machine',
                    route_name='start')

    config.add_route('reboot', '/backends/{backend}/machines/{machine}/reboot')
    config.add_view('mist.io.views.reboot_machine',
                    route_name='reboot')

    config.add_route('destroy', '/backends/{backend}/machines/{machine}/destroy')
    config.add_view('mist.io.views.destroy_machine',
                    route_name='destroy')

    config.add_route('stop', '/backends/{backend}/machines/{machine}/stop')
    config.add_view('mist.io.views.stop_machine',
                    route_name='stop')

    config.add_route('list_sizes', '/backends/{backend}/sizes/list')
    config.add_view('mist.io.views.list_sizes',
                    route_name='list_sizes')

    config.add_route('list_images', '/backends/{backend}/images/list')
    config.add_view('mist.io.views.list_images',
                    route_name='list_images')

    return config.make_wsgi_app()

