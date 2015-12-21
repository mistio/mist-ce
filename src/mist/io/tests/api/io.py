import json
from time import sleep

from mist.io.tests.api.mistrequests import MistRequests


class MistIoApi(object):

    def __init__(self, uri):
        self.uri = uri

    def list_backends(self, cookie=None, csrf_token=None, api_token=None):

        req = MistRequests(uri=self.uri + '/backends', cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call
        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' %e

        return req

    def supported_providers(self, cookie=None, csrf_token=None,
                            api_token=None):

        req = MistRequests(uri=self.uri + '/providers', cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call
        # assert response.ok, u'\nGot %d Response Status: %s \n%s' %
        # (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        # except Exception as e:
        #     assert False, u'Exception: %s' %e
        #
        # SUPPORTED_PROVIDERS = params['supported_providers']
        # print '\nSupported providers:'
        # return SUPPORTED_PROVIDERS

        return req

    def add_backend(self, title, provider, apikey, apisecret, apiurl=None,
                    tenant_name=None, cookie=None, csrf_token=None,
                    api_token=None):

        payload = {
            'title': title,
            'provider': provider,
            'apikey': apikey,
            'apisecret': apisecret,
            'apiurl': apiurl,
            'tenant_name': tenant_name
        }

        req = MistRequests(uri=self.uri + '/backends', data=json.dumps(payload),
                           cookie=cookie, csrf_token=csrf_token,
                           api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response
        # .status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' % e

        return req

    def delete_backend(self, backend_id, cookie=None, csrf_token=None,
                       api_token=None):

        req = MistRequests(uri=self.uri+'/backends/'+backend_id, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' %
        # (response.status_code, response.reason, response.text)
        #
        # print "Deleted Backend with id: %s" % backend_id

        return req

    def list_images(self, backend_id, search_term=None, cookie=None,
                    csrf_token=None, api_token=None):

        uri = self.uri + "/backends/" + backend_id + "/images",
        if not search_term:
            req = MistRequests(uri=uri, cookie=cookie, csrf_token=csrf_token,
                               api_token=api_token)
            req.get = req.unavailable_api_call
        else:
            req = MistRequests(uri=uri, data={'search_term': search_term},
                               cookie=cookie, csrf_token=csrf_token)
            req.post = req.unavailable_api_call

        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' % e

        return req

    def list_sizes(self, backend_id, cookie=None, csrf_token=None,
                   api_token=None):

        req = MistRequests(uri=self.uri + "/backends/" + backend_id + "/sizes",
                           cookie=cookie, csrf_token=csrf_token,
                           api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' % e

        return req

    def list_locations(self, backend_id, cookie=None, csrf_token=None,
                       api_token=None):

        req = MistRequests(uri=self.uri + "/backends/" + backend_id + "/locations",
                           cookie=cookie, csrf_token=csrf_token,
                           api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' % e

        return req

    def rename_backend(self, backend_id, new_name, cookie=None, csrf_token=None,
                       api_token=None):

        req = MistRequests(uri=self.uri + "/backends/" + backend_id,
                           data={'new_name': new_name}, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.post = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

        return req

    def add_key(self, name, private, cookie=None, csrf_token=None,
                api_token=None):
        payload = {
            'id': name,
            'priv': private
        }

        req = MistRequests(uri=self.uri + "/keys", cookie=cookie, data=payload,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.post = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' %e

        return req

    def edit_key(self, key_id, new_name, cookie=None, csrf_token=None,
                 api_token=None):

        req = MistRequests(uri=self.uri + "/keys/" + key_id,
                           data={'new_id': new_name}, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.post = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)

        return req

    def list_keys(self, cookie=None, csrf_token=None, api_token=None):

        req = MistRequests(uri=self.uri + "/keys", cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' %e

        return req

    def delete_key(self, key_id, cookie=None, csrf_token=None, api_token=None):

        req = MistRequests(uri=self.uri + "/keys/" + key_id, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     print "Deleted Key: %s" % key_id
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' %e

        return req

    def generate_keypair(self, cookie=None, csrf_token=None, api_token=None):

        req = MistRequests(uri=self.uri + "/keys", cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     print params
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' %e

        return req

    def get_private_key(self, key_id, cookie=None, csrf_token=None,
                        api_token=None):

        req = MistRequests(uri=self.uri + "/keys/" + key_id + "/private",
                           cookie=cookie, csrf_token=csrf_token,
                           api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     print response.text
        #     assert False, u'Exception: %s' %e

        return req

    def get_public_key(self, key_id, cookie=None, csrf_token=None,
                       api_token=None):

        req = MistRequests(uri=self.uri + "/keys/" + key_id + "/public",
                           cookie=cookie, csrf_token=csrf_token,
                           api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     print response.text
        #     assert False, u'Exception: %s' % e

        return req

    def list_machines(self, backend_id, cookie=None, csrf_token=None,
                      api_token=None):

        req = MistRequests(uri=self.uri + '/backends/' + backend_id + "/machines",
                           cookie=cookie, csrf_token=csrf_token,
                           api_token=api_token)

        req.post = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        # try:
        #     params = response.json()
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' % e

        return req

    def create_machine(self, backend_id, key_id, name, location, image, size,
                       script=None, disk=None, image_extra=None, cookie=None,
                       csrf_token=None, api_token=None):
        #! disk and image_extra are required only for Linode
        payload = {
            #'backend': backend_id,
            'key': key_id,
            'name': name,
            'location': location,
            'image': image,
            'size': size,
            'script': script,
            'disk': disk,
            'image_extra': image_extra
        }
        req = MistRequests(uri=self.uri + "/backends/" + backend_id + "/machines",
                         cookie=cookie, data=payload, timeout=600,
                         csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        #
        # try:
        #     params = response.json()
        #     print "Created machine with Name: %s and id %s a" % (params['name'], params['id'])
        #     return params
        # except Exception as e:
        #     assert False, u'Exception: %s' % e

        return req

    def destroy_machine(self, backend_id, machine_id, cookie=None,
                        csrf_token=None, api_token=None):

        uri = self.uri + "/backends/" + backend_id + "/machines/" + machine_id
        req = MistRequests(uri=uri, data={'action': 'destroy'}, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        # print "Destroyed machine with id: %s" % machine_id

        return req

    def reboot_machine(self, backend_id, machine_id, cookie=None,
                       csrf_token=None, api_token=None):

        uri = self.uri + "/backends/" + backend_id + "/machines/" + machine_id
        req = MistRequests(uri=uri, cookie=cookie, data={'action': 'reboot'},
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        # print "Rebooted machine with id: %s" % machine_id

        return req

    def start_machine(self, backend_id, machine_id, cookie=None,
                      csrf_token=None, api_token=None):
        # sleep(30)
        uri = self.uri + "/backends/" + backend_id + "/machines/" + machine_id
        req = MistRequests(uri=uri, data={'action': 'start'}, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # if response.status_code == 503:
        #     print "Machine state is not yet ready to be started"
        #     return
        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        # print "Started machine with id: %s" % machine_id

        return req

    def stop_machine(self, backend_id, machine_id, cookie=None, csrf_token=None,
                     api_token=None):

        uri = self.uri + "/backends/" + backend_id + "/machines/" + machine_id
        req = MistRequests(uri-uri, data={'action': 'stop'}, cookie=cookie,
                           csrf_token=csrf_token, api_token=api_token)

        req.get = req.unavailable_api_call
        req.put = req.unavailable_api_call
        req.delete = req.unavailable_api_call

        # assert response.ok, u'\nGot %d Response Status: %s \n%s' % (response.status_code, response.reason, response.text)
        # print "Stopped machine with id: %s" % machine_id

        return req
