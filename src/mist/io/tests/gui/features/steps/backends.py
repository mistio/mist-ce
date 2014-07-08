from behave import *
from time import time, sleep

try:
    from mist.io.tests.settings import CREDENTIALS
except ImportError:
    pass


@given(u'backends credentials')
def load_backend_credentials(context):
    context.credentials = CREDENTIALS


@given(u'"{backend}" backend added')
def given_backend(context, backend):
    end_time = time() + 5
    while time() < end_time:
        try:
            backends = context.browser.find_element_by_id("backend-buttons")
            backend_buttons = backends.find_elements_by_class_name("ui-btn")
            if backend_buttons:
                break
        except:
            pass

        sleep(2)

    if backend_buttons:
        for button in backend_buttons:
            if backend in button.text:
                return

    if "openstack" in backend.lower():
        creds = "OPENSTACK"
    elif "rackspace" in backend.lower():
        creds = "RACKSPACE"
    elif "softlayer" in backend.lower():
        creds = "SOFTLAYER"
    elif "hp" in backend.lower():
        creds = "HP"
    elif "ec2" in backend.lower():
        creds = "EC2"
    elif "nepho" in backend.lower():
        creds = "NEPHOSCALE"
    elif "linode" in backend.lower():
        creds = "LINODE"
    elif "docker" in backend.lower():
        creds = "DOCKER"
    else:
        assert False, u'Could not find credentials for %s' % backend

    context.execute_steps('''
    When I click the "Add backend" button
    And I click the button that contains "Select provider"
    And I click the "%s" button
    And I use my "%s" credentials
    And I click the "Add" button
    Then the "%s" backend should be added within 30 seconds
    ''' % (backend, creds, backend))


@when(u'I use my "{backend}" credentials')
def backend_creds(context, backend):
    if "OPENSTACK" in backend:
        username_input = context.browser.find_element_by_id("new-backend-first-field")
        username_input.send_keys(context.credentials['OPENSTACK']['username'])
        pass_input = context.browser.find_element_by_id("new-backend-second-field")
        pass_input.send_keys(context.credentials['OPENSTACK']['password'])
        auth_url_input = context.browser.find_element_by_id("new-backend-openstack-url")
        auth_url_input.send_keys(context.credentials['OPENSTACK']['auth_url'])
        tenant_input = context.browser.find_element_by_id("new-backend-openstack-tenant")
        tenant_input.send_keys(context.credentials['OPENSTACK']['tenant'])
    elif "RACKSPACE" in backend:
        username_input = context.browser.find_element_by_id("new-backend-first-field")
        username_input.send_keys(context.credentials['RACKSPACE']['username'])
        api_key_input = context.browser.find_element_by_id("new-backend-second-field")
        api_key_input.send_keys(context.credentials['RACKSPACE']['api_secret'])
    elif "HP" in backend:
        username_input = context.browser.find_element_by_id("new-backend-first-field")
        username_input.send_keys(context.credentials['HP']['username'])
        pass_input = context.browser.find_element_by_id("new-backend-second-field")
        pass_input.send_keys(context.credentials['HP']['password'])
        tenant_input = context.browser.find_element_by_id("new-backend-openstack-tenant")
        tenant_input.send_keys(context.credentials['HP']['tenant'])
    elif "SOFTLAYER" in backend:
        api_key_input = context.browser.find_element_by_id("new-backend-first-field")
        api_key_input.send_keys(context.credentials['SOFTLAYER']['api_key'])
        api_secret_input = context.browser.find_element_by_id("new-backend-second-field")
        api_secret_input.send_keys(context.credentials['SOFTLAYER']['api_secret'])
    elif "EC2" in backend:
        api_key_input = context.browser.find_element_by_id("new-backend-first-field")
        api_key_input.send_keys(context.credentials['EC2']['api_key'])
        api_secret_input = context.browser.find_element_by_id("new-backend-second-field")
        api_secret_input.send_keys(context.credentials['EC2']['api_secret'])
    elif "NEPHOSCALE" in backend:
        username_input = context.browser.find_element_by_id("new-backend-first-field")
        username_input.send_keys(context.credentials['NEPHOSCALE']['username'])
        api_key_input = context.browser.find_element_by_id("new-backend-second-field")
        api_key_input.send_keys(context.credentials['NEPHOSCALE']['password'])
    elif "LINODE" in backend:
        username_input = context.browser.find_element_by_id("new-backend-first-field")
        username_input.send_keys(context.credentials['LINODE']['username'])
        api_key_input = context.browser.find_element_by_id("new-backend-second-field")
        api_key_input.send_keys(context.credentials['LINODE']['api_key'])
    elif "DOCKER" in backend:
        username_input = context.browser.find_element_by_id("new-backend-docker-url")
        username_input.send_keys(context.credentials['DOCKER']['host'])


@when(u'I rename the backend to "{new_name}"')
def rename_backend(context, new_name):
    popup = context.browser.find_element_by_id("edit-backend-popup")
    textfield = popup.find_element_by_class_name("ui-input-text").find_element_by_tag_name("input")
    for i in range(20):
        textfield.send_keys(u'\ue003')

    for letter in new_name:
        textfield.send_keys(letter)
        sleep(1)


@then(u'the "{backend}" backend should be added within {seconds} seconds')
def backend_added(context, backend, seconds):
    end_time = time() + int(seconds)
    while time() < end_time:
        backends = context.browser.find_element_by_id("backend-buttons")
        backend_buttons = backends.find_elements_by_class_name("ui-btn")
        for button in backend_buttons:
            if backend in button.text:
                return
        sleep(2)

    assert False, u'%s is not added within %s seconds' %(backend, seconds)


@then(u'the "{backend}" backend should be deleted')
def backend_deleted(context, backend):
    sleep(1)
    backends = context.browser.find_element_by_id("backend-buttons")
    backend_buttons = backends.find_elements_by_class_name("ui-btn")

    for button in backend_buttons:
        if backend in button.text:
            assert False, u'%s backend is not deleted' % backend
    return