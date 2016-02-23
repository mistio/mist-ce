import requests


class MistRequests(object):
    """
    Simple class to make requests with or without cookies etc.
    This way we can have the same request methods both in io and core
    """

    def __init__(self, uri, params=None, data=None, json=None, cookie=None,
                 timeout=None, csrf_token=None, api_token=None):
        self.headers = {}
        if cookie:
            self.headers.update({'Cookie': cookie})
        if csrf_token:
            self.headers.update({'Csrf-Token': csrf_token})
        if api_token:
            self.headers.update({'Authorization': api_token})
        self.timeout = timeout
        self.uri = uri
        self.data = data
        self.params = params
        self.json = json

    def post(self):
        response = requests.post(self.uri, data=self.data, json=self.json,
                                 headers=self.headers, timeout=self.timeout)
        return response

    def get(self):
        response = requests.get(self.uri, params=self.params,
                                headers=self.headers, timeout=self.timeout)
        return response

    def put(self):
        response = requests.put(self.uri, data=self.data,
                                headers=self.headers, timeout=self.timeout)
        return response

    def delete(self):
        response = requests.delete(self.uri, params=self.params, data=self.data,
                                   json=self.json, headers=self.headers,
                                   timeout=self.timeout)
        return response

    def unavailable_api_call(self, *args, **kwargs):
        raise NotImplementedError("This method call is not available")
