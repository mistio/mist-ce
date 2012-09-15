class CORSMiddleware(object):
    """ Middleware that allows Cross-origin resource sharing
    """

    def __init__(self, app=None, origin='https://mist.io'):
        self.app = app
        self.origin = origin
        self.routes_mapper = app.routes_mapper

    def __call__(self, environ, start_response):
        def new_start_response(status, headers, exc_info=None):
            headers.append(
                    ('Access-Control-Allow-Origin', self.origin))
            return start_response(status, headers, exc_info)
        return self.app(environ, new_start_response)
