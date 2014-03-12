import requests


class MyRequests(object):
    """
    Simple class to make requests with or withour cookies etc.
    This way we can have the same request methods both in io and core
    """

    def __init__(self, uri, data=None, cookie=None, timeout=None, csrf=None):
        self.headers = {'Cookie': cookie, 'Csrf-Token': csrf}
        self.timeout = timeout
        self.uri = uri
        self.data = data

    def post(self):
        response = requests.post(self.uri, data=self.data, headers=self.headers, timeout=self.timeout)
        return response

    def get(self):
        response = requests.get(self.uri, data=self.data, headers=self.headers, timeout=self.timeout)
        return response

    def put(self):
        response = requests.put(self.uri, data=self.data, headers=self.headers, timeout=self.timeout)
        return response

    def delete(self):
        response = requests.delete(self.uri, data=self.data, headers=self.headers, timeout=self.timeout)
        return response
