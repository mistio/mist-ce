from behave import *
from time import time, sleep

try:
    from mist.io.tests.settings import CREDENTIALS
except ImportError:
    pass


@given(u'clouds credentials')
def load_cloud_credentials(context):
    context.credentials = CREDENTIALS


@given(u'"{cloud}" cloud added')
def given_cloud(context, cloud):
    cloud_buttons = []
    end_time = time() + 5
    while time() < end_time:
        try:
            clouds = context.browser.find_element_by_id("cloud-buttons")
            cloud_buttons = clouds.find_elements_by_class_name("ui-btn")
            if cloud_buttons:
                break
        except:
            pass

        sleep(2)

    if cloud_buttons:
        for button in cloud_buttons:
            if cloud in button.text:
                return

    if "openstack" in cloud.lower():
        creds = "OPENSTACK"
    elif "rackspace" in cloud.lower():
        creds = "RACKSPACE"
    elif "softlayer" in cloud.lower():
        creds = "SOFTLAYER"
    elif "hp" in cloud.lower():
        creds = "HP"
    elif "ec2" in cloud.lower():
        creds = "EC2"
    elif "nepho" in cloud.lower():
        creds = "NEPHOSCALE"
    elif "linode" in cloud.lower():
        creds = "LINODE"
    elif "docker" in cloud.lower():
        creds = "DOCKER"
    elif "digitalocean" in cloud.lower():
        creds = "DIGITALOCEAN"
    elif "indonesian" in cloud.lower():
        creds = "INDONESIAN"
    elif "libvirt" in cloud.lower():
        creds = "LIBVIRT"
    else:
        assert False, u'Could not find credentials for %s' % cloud

    context.execute_steps('''
    When I click the "Add cloud" button
    And I click the button that contains "Select provider"
    And I click the "%s" button
    And I use my "%s" credentials
    And I click the "Add" button
    Then the "%s" cloud should be added within 30 seconds
    ''' % (cloud, creds, cloud))


@when(u'I use my "{cloud}" credentials')
def cloud_creds(context, cloud):
    if "AZURE" in cloud:
        subscription_id = context.browser.find_element_by_id("subscription_id")
        subscription_id.send_keys(context.credentials['AZURE']['subscription_id'])
        sleep(1)
        add_cert_button = context.browser.find_element_by_id("certificate")
        add_cert_button.click()
        sleep(1)
        upload_area = context.browser.find_element_by_id("upload-area")
        upload_area.send_keys(context.credentials['AZURE']['certificate'])
        file_upload_ok = context.browser.find_element_by_id("file-upload-ok")
        file_upload_ok.click()
    elif "GCE" in cloud:
        title = context.browser.find_element_by_id("title")
        for i in range(1, 6):
            title.send_keys(u'\ue003')
        title.send_keys("Google Compute Engine")
        email = context.browser.find_element_by_id("email")
        email.send_keys(context.credentials['GCE']['email'])
        project_id = context.browser.find_element_by_id("project_id")
        project_id.send_keys(context.credentials['GCE']['project_id'])
        add_key = context.browser.find_element_by_id("private_key")
        add_key.click()
        sleep(1)
        upload_area = context.browser.find_element_by_id("upload-area")
        upload_area.send_keys(context.credentials['GCE']['private_key'])
        file_upload_ok = context.browser.find_element_by_id("file-upload-ok")
        file_upload_ok.click()

    elif "OPENSTACK" in cloud:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['OPENSTACK']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.credentials['OPENSTACK']['password'])
        auth_url = context.browser.find_element_by_id("auth_url")
        auth_url.send_keys(context.credentials['OPENSTACK']['auth_url'])
        tenant_name = context.browser.find_element_by_id("tenant_name")
        tenant_name.send_keys(context.credentials['OPENSTACK']['tenant_name'])
    elif "RACKSPACE" in cloud:
        context.execute_steps(u'When I click the button that contains "Select Region"')
        context.execute_steps(u'When I click the button that contains "%s"' %
                              context.credentials['RACKSPACE']['region'])
        sleep(1)
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("Rackspace")
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['RACKSPACE']['username'])
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.credentials['RACKSPACE']['api_key'])
    elif "HP" in cloud:
        context.execute_steps(u'When I click the button that contains "Select Region"')
        context.execute_steps(u'When I click the button that contains "%s"' % context.credentials['HP']['region'])
        sleep(1)
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("HP Helion Cloud")
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['HP']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.credentials['HP']['password'])
        tenant_name = context.browser.find_element_by_id("tenant_name")
        tenant_name.send_keys(context.credentials['HP']['tenant_name'])
    elif "SOFTLAYER" in cloud:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['SOFTLAYER']['username'])
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.credentials['SOFTLAYER']['api_key'])
    elif "EC2" in cloud:
        context.execute_steps(u'When I click the button that contains "Select Region"')
        context.execute_steps(u'When I click the button that contains "%s"' % context.credentials['EC2']['region'])
        sleep(1)
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("EC2")
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.credentials['EC2']['api_key'])
        api_secret = context.browser.find_element_by_id("api_secret")
        api_secret.send_keys(context.credentials['EC2']['api_secret'])
    elif "NEPHOSCALE" in cloud:
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("NephoScale")
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['NEPHOSCALE']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.credentials['NEPHOSCALE']['password'])
    elif "LINODE" in cloud:
        api_key = context.browser.find_element_by_id("api_key")
        api_key.send_keys(context.credentials['LINODE']['api_key'])
    elif "DOCKER" in cloud:
        host = context.browser.find_element_by_id("docker_host")
        host.send_keys(context.credentials['DOCKER']['host'])
        port = context.browser.find_element_by_id("docker_port")
        for i in range(6):
            port.send_keys(u'\ue003')
        port.send_keys(context.credentials['DOCKER']['port'])
        advanced_button = context.browser.find_element_by_class_name("toggle-field")
        advanced_button.click()
        key_file = context.browser.find_element_by_id("key_file")
        key_file.click()
        key_upload = context.browser.find_element_by_id("file-upload-input")
        key_upload.send_keys(context.credentials['DOCKER']['key_pem'])
        sleep(1)
        file_upload_ok = context.browser.find_element_by_id("file-upload-ok")
        file_upload_ok.click()
        sleep(2)
        cert_upload = context.browser.find_element_by_id("file-upload-input")
        cert_upload.send_keys(context.credentials['DOCKER']['cert_pem'])
        sleep(1)
        file_upload_ok = context.browser.find_element_by_id("file-upload-ok")
        file_upload_ok.click()
        sleep(2)
    elif "DIGITALOCEAN" in cloud:
        token_input = context.browser.find_element_by_id("token")
        token_input.send_keys(context.credentials['DIGITALOCEAN']['token'])
    elif "VMWARE" in cloud:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['VMWARE']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.credentials['VMWARE']['password'])
        organization = context.browser.find_element_by_id("organization")
        organization.send_keys(context.credentials['VMWARE']['organization'])
        host = context.browser.find_element_by_id("host")
        host.send_keys(context.credentials['VMWARE']['host'])
    elif "INDONESIAN" in cloud:
        username = context.browser.find_element_by_id("username")
        username.send_keys(context.credentials['INDONESIAN']['username'])
        password = context.browser.find_element_by_id("password")
        password.send_keys(context.credentials['INDONESIAN']['password'])
        organization = context.browser.find_element_by_id("organization")
        organization.send_keys(context.credentials['INDONESIAN']['organization'])
    elif "LIBVIRT" in cloud:
        title = context.browser.find_element_by_id("title")
        for i in range(20):
            title.send_keys(u'\ue003')
        title.send_keys("KVM (via libvirt)")
        hostname = context.browser.find_element_by_id("machine_hostname")
        hostname.send_keys(context.credentials['LIBVIRT']['hostname'])
        key_button = context.browser.find_element_by_id("machine_key")
        key_button.click()
        sleep(2)
        context.execute_steps(u"""
        When I click the button that contains "Add Key"
        """)
        sleep(2)
        key_name = context.browser.find_element_by_id("key-add-id")
        key_name.send_keys("libvirt")
        upload = context.browser.find_element_by_id("key-add-upload")
        upload.send_keys(context.credentials['LIBVIRT']['key_path'])
        sleep(1)
        key_add_button = context.browser.find_element_by_id("key-add-ok")
        key_add_button.click()
        sleep(5)


@when(u'I rename the cloud to "{new_name}"')
def rename_cloud(context, new_name):
    popup = context.browser.find_element_by_id("cloud-edit")
    textfield = popup.find_element_by_class_name("ui-input-text").find_element_by_tag_name("input")
    for i in range(20):
        textfield.send_keys(u'\ue003')

    for letter in new_name:
        textfield.send_keys(letter)
        sleep(0.7)


@then(u'the "{cloud}" cloud should be added within {seconds} seconds')
def cloud_added(context, cloud, seconds):
    end_time = time() + int(seconds)
    while time() < end_time:
        try:
            clouds = context.browser.find_element_by_id("cloud-buttons")
            cloud_buttons = clouds.find_elements_by_class_name("ui-btn")
            for button in cloud_buttons:
                if cloud in button.text:
                    return
            sleep(2)
        except:
            sleep(2)

    assert False, u'%s is not added within %s seconds' %(cloud, seconds)


@then(u'the "{cloud}" cloud should be deleted')
def cloud_deleted(context, cloud):
    sleep(1)
    clouds = context.browser.find_element_by_id("cloud-buttons")
    cloud_buttons = clouds.find_elements_by_class_name("ui-btn")

    for button in cloud_buttons:
        if cloud in button.text:
            assert False, u'%s cloud is not deleted' % cloud
    return
