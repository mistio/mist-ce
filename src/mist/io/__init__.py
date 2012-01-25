from pyramid.config import Configurator
from mist.io.resources import Root

def main(global_config, **settings):
    """This function returns a Pyramid WSGI application"""
    config = Configurator(root_factory=Root, settings=settings)

    config.add_static_view('static', 'mist.io:static')

    config.add_route('home', '/')
    config.add_view('mist.io.views.home',
                    route_name='home',
                    request_method='GET',
                    renderer='templates/home.pt')

    config.add_route('list_machines', '/backends/{backend}/machines')
    config.add_view('mist.io.views.list_machines',
                    route_name='list_machines',
                    request_method='GET')

    config.add_route('create_machine', '/backends/{backend}/machines')
    config.add_view('mist.io.views.create_machine',
                    route_name='create_machine',
                    request_method='POST')

    config.add_route('machine_action', '/backends/{backend}/machines/{machine}')
    config.add_view('mist.io.views.machine_action',
                    request_method='POST',
                    route_name='machine_action')

    config.add_route('list_metadata', '/backends/{backend}/machines/{machine}/metadata')
    config.add_view('mist.io.views.list_metadata',
                    request_method='GET',
                    route_name='list_metadata')

    config.add_route('set_metadata', '/backends/{backend}/machines/{machine}/metadata')
    config.add_view('mist.io.views.set_metadata',
                    request_method='POST',
                    route_name='set_metadata')

    config.add_route('list_alerts', '/backends/{backend}/machines/{machine}/alerts')
    config.add_view('mist.io.views.list_alerts',
                    request_method='GET',
                    route_name='list_alerts')

    config.add_route('send_alert', '/backends/{backend}/machines/{machine}/alerts')
    config.add_view('mist.io.views.send_alert',
                    request_method='POST',
                    route_name='send_alert')

    config.add_route('list_alert_settings', '/backends/{backend}/machines/{machine}/alerts/settings')
    config.add_view('mist.io.views.list_alert_settings',
                    request_method='GET',
                    route_name='list_alert_settings')

    config.add_route('update_alert', '/backends/{backend}/machines/{machine}/alerts/settings')
    config.add_view('mist.io.views.update_alert',
                    request_method='POST',
                    route_name='update_alert')

    config.add_route('list_images', '/backends/{backend}/images')
    config.add_view('mist.io.views.list_images',
                    route_name='list_images',
                    request_method='GET')

    config.add_route('list_sizes', '/backends/{backend}/sizes')
    config.add_view('mist.io.views.list_sizes',
                    request_method='GET',
                    route_name='list_sizes')

    config.add_route('list_locations', '/backends/{backend}/locations')
    config.add_view('mist.io.views.list_locations',
                    request_method='GET',
                    route_name='list_locations')

    return config.make_wsgi_app()
