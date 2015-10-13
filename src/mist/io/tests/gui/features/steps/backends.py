from behave import *
from time import time, sleep
from selenium.common.exceptions import NoSuchElementException
from mist.io.tests.gui.features.steps.general import search_for_button

try:
    from mist.io.tests.settings import CREDENTIALS
except ImportError:
    pass


@given(u'"{backend}" backend has been added')
def given_backend(context, backend):
    backend_buttons = []
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
            if backend.lower() in button.text.lower():
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
    elif "digitalocean" in backend.lower():
        creds = "DIGITALOCEAN"
    elif "indonesian" in backend.lower():
        creds = "INDONESIAN"
    elif "libvirt" in backend.lower():
        creds = "LIBVIRT"
    else:
        assert False, u'Could not find credentials for %s' % backend

    context.execute_steps(u'''
        When I click the button "Add cloud"
        And I click the button "%s"
        And I wait for 1 seconds
        And I use my "%s" credentials
        And I click the button "Add"
        Then the "%s" backend should be added within 30 seconds
    ''' % (backend, creds, backend))


@when(u'I use my "{backend}" credentials')
def backend_creds(context, backend):
    if "AZURE" in backend:
        subscription_id = None
        for i in range(0, 2):
            try:
                subscription_id = context.browser.find_element_by_id("subscription_id")
                break
            except NoSuchElementException as e:
                if i == 2:
                    raise e
                sleep(1)
        subscription_id.send_keys(context.mist_config['CREDENTIALS']['AZURE']['subscription_id'])
        context.execute_steps(u'''
        When I click the "Add Certificate" button inside the "Add Cloud" panel
        Then I expect for "file-upload-popup" popup to appear within max 2 seconds
        ''')
        upload_area = context.browser.find_element_by_id("upload-area")
        upload_area.send_keys(context.mist_config['CREDENTIALS']['AZURE']['certificate'])
        context.execute_steps(u'''
        When I click the "Done" button inside the "Upload" popup
        Then I expect for "file-upload-popup" popup to disappear within max 2 seconds
        ''')
    elif "GCE" in backend:
        title = context.browser.find_element_by_id("title")
        for i in range(1, 6):
            title.send_keys(u'\ue003')
        title.send_keys("GCE")
        project_id = context.browser.find_element_by_id("project_id")
        project_id.send_keys(context.mist_config['CREDENTIALS']['GCE']['project_id'])
        context.execute_steps(u'''
        When I click the "Add JSON Key" button inside the "Add Cloud" panel
        Then I expect for "file-upload-popup" popup to appear within max 2 seconds
        ''')
        upload_area = context.browser.find_element_by_id("file-upload-input")
        upload_area.send_keys(context.mist_config['CREDENTIALS']['GCE']['private_key'])
        context.execute_steps(u'''
        Then I expect for "file-upload-ok" to be clickable within max 2 seconds
        When I click the "Done" button inside the "Upload" popup
        Then I expect for "file-upload-popup" popup to disappear within max 4 seconds
        ''')
    elif "OPENSTACK" in backend:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['OPENSTACK']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.mist_config['CREDENTIALS']['OPENSTACK']['password'])
        auth_url = context.browser.find_element_by_id("auth_url")
        auth_url.send_keys(context.mist_config['CREDENTIALS']['OPENSTACK']['auth_url'])
        tenant_name = context.browser.find_element_by_id("tenant_name")
        tenant_name.send_keys(context.mist_config['CREDENTIALS']['OPENSTACK']['tenant_name'])
    elif "RACKSPACE" in backend:
        context.execute_steps(u'''
        When I click the button "Select Region"
        And I click the button "%s"''' % context.mist_config['CREDENTIALS']['RACKSPACE']['region'])
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("Rackspace")
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['RACKSPACE']['username'])
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.mist_config['CREDENTIALS']['RACKSPACE']['api_key'])
    elif "HP" in backend:
        context.execute_steps(u'''
        When I click the button "Select Region"
        And I click the button "%s"''' % context.mist_config['CREDENTIALS']['HP']['region'])
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("HP Helion Cloud")
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['HP']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.mist_config['CREDENTIALS']['HP']['password'])
        tenant_name = context.browser.find_element_by_id("tenant_name")
        tenant_name.send_keys(context.mist_config['CREDENTIALS']['HP']['tenant_name'])
    elif "SOFTLAYER" in backend:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['SOFTLAYER']['username'])
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.mist_config['CREDENTIALS']['SOFTLAYER']['api_key'])
    elif "EC2" in backend:
        context.execute_steps(u'''
                When I click the button "Select Region"
                And I wait for 1 seconds
                When I click the button "%s"
        ''' % context.mist_config['CREDENTIALS']['EC2']['region'])
        sleep(1)
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("EC2")
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.mist_config['CREDENTIALS']['EC2']['api_key'])
        api_secret = context.browser.find_element_by_id("api_secret")
        api_secret.send_keys(context.mist_config['CREDENTIALS']['EC2']['api_secret'])
    elif "NEPHOSCALE" in backend:
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("NephoScale")
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['NEPHOSCALE']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.mist_config['CREDENTIALS']['NEPHOSCALE']['password'])
    elif "LINODE" in backend:
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.mist_config['CREDENTIALS']['LINODE']['api_key'])
    elif "DOCKER" in backend:
        host = context.browser.find_element_by_id("docker_host")
        host.send_keys(context.mist_config['CREDENTIALS']['DOCKER']['host'])
        port = context.browser.find_element_by_id("docker_port")
        for i in range(6):
            port.send_keys(u'\ue003')
        port.send_keys(context.mist_config['CREDENTIALS']['DOCKER']['port'])
        advanced_button = context.browser.find_element_by_class_name("toggle-field")
        advanced_button.click()
        key_file = context.browser.find_element_by_id("key_file")
        key_file.click()
        key_upload = context.browser.find_element_by_id("file-upload-input")
        key_upload.send_keys(context.mist_config['CREDENTIALS']['DOCKER']['key_pem'])
        sleep(1)
        file_upload_ok = context.browser.find_element_by_id("file-upload-ok")
        file_upload_ok.click()
        sleep(2)
        cert_upload = context.browser.find_element_by_id("file-upload-input")
        cert_upload.send_keys(context.mist_config['CREDENTIALS']['DOCKER']['cert_pem'])
        sleep(1)
        file_upload_ok = context.browser.find_element_by_id("file-upload-ok")
        file_upload_ok.click()
        sleep(2)
    elif "DIGITALOCEAN" in backend:
        token_input = context.browser.find_element_by_id("token")
        token_input.send_keys(context.mist_config['CREDENTIALS']['DIGITALOCEAN']['token'])
    elif "VMWARE" in backend:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['VMWARE']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.mist_config['CREDENTIALS']['VMWARE']['password'])
        organization = context.browser.find_element_by_id("organization")
        organization.send_keys(context.mist_config['CREDENTIALS']['VMWARE']['organization'])
        host = context.browser.find_element_by_id("host")
        host.send_keys(context.mist_config['CREDENTIALS']['VMWARE']['host'])
    elif "INDONESIAN" in backend:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.mist_config['CREDENTIALS']['INDONESIAN']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.mist_config['CREDENTIALS']['INDONESIAN']['password'])
        organization = context.browser.find_element_by_id("organization")
        organization.send_keys(context.mist_config['CREDENTIALS']['INDONESIAN']['organization'])
    elif "LIBVIRT" in backend:
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("KVM (via libvirt)")
        hostname = context.browser.find_element_by_id("machine_hostname")
        hostname.send_keys(context.mist_config['CREDENTIALS']['LIBVIRT']['hostname'])
        key_button = context.browser.find_element_by_id("machine_key")
        key_button.click()
        sleep(2)
        context.execute_steps(u'When I click the button "Add Key"')
        sleep(2)
        key_name = context.browser.find_element_by_id("key-add-id")
        key_name.send_keys("libvirt")
        upload = context.browser.find_element_by_id("key-add-upload")
        upload.send_keys(context.mist_config['CREDENTIALS']['LIBVIRT']['key_path'])
        sleep(1)
        key_add_button = context.browser.find_element_by_id("key-add-ok")
        key_add_button.click()
        sleep(5)


@when(u'I rename the backend to "{new_name}"')
def rename_backend(context, new_name):
    popup = context.browser.find_element_by_id("backend-edit")
    textfield = popup.find_element_by_class_name("ui-input-text").find_element_by_tag_name("input")
    for i in range(20):
        textfield.send_keys(u'\ue003')

    for letter in new_name:
        textfield.send_keys(letter)
        sleep(0.7)


@then(u'the "{backend}" backend should be added within {seconds} seconds')
def backend_added(context, backend, seconds):
    end_time = time() + int(seconds)
    while time() < end_time:
        button = search_for_button(context, backend, btn_cls='cloud-btn')
        if button:
            return
        sleep(2)

    assert False, u'%s is not added within %s seconds' %(backend, seconds)


@then(u'the "{backend}" backend should be deleted')
def backend_deleted(context, backend):
    button = search_for_button(context, backend, btn_cls='cloud-btn')
    assert not button, ""
