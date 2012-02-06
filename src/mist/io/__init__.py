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

    config.add_route('machines', '/backends/{backend}/machines')
    config.add_view('mist.io.views.list_machines',
                    route_name='machines',
                    request_method='GET')
    config.add_view('mist.io.views.create_machine',
                    route_name='machines',
                    request_method='POST')

    config.add_route('machine', '/backends/{backend}/machines/{machine}')
    config.add_view('mist.io.views.machine_action',
                    request_method='POST',
                    route_name='machine')

    config.add_route('metadata', '/backends/{backend}/machines/{machine}/metadata')
    config.add_view('mist.io.views.set_metadata',
                    request_method='POST',
                    route_name='metadata')
    config.add_view('mist.io.views.list_metadata',
                    request_method='GET',
                    route_name='metadata')

    config.add_route('alerts', '/backends/{backend}/machines/{machine}/alerts')
    config.add_view('mist.io.views.list_alerts',
                    request_method='GET',
                    route_name='alerts')
    config.add_view('mist.io.views.send_alert',
                    request_method='POST',
                    route_name='alerts')

    config.add_route('alert_settings', '/backends/{backend}/machines/{machine}/alerts/settings')
    config.add_view('mist.io.views.list_alert_settings',
                    request_method='GET',
                    route_name='alert_settings')
    config.add_view('mist.io.views.update_alert',
                    request_method='POST',
                    route_name='alert_settings')

    config.add_route('images', '/backends/{backend}/images')
    config.add_view('mist.io.views.list_images',
                    route_name='images',
                    request_method='GET')

    config.add_route('sizes', '/backends/{backend}/sizes')
    config.add_view('mist.io.views.list_sizes',
                    request_method='GET',
                    route_name='sizes')

    config.add_route('locations', '/backends/{backend}/locations')
    config.add_view('mist.io.views.list_locations',
                    request_method='GET',
                    route_name='locations')

    return config.make_wsgi_app()
