"""
@given:
-------

@when:
------
And I use my "{provider}" credentials   --> backends_use_credentials
I change the name of the backend to "{new_name}"    --> rename_backend
I flip the backend switch       --> backends_flip_switch

@then:
------
I should see the "{backend}" Backend added within {timeout} seconds    --> backends_see_backend_buttons
"{backend}" backend should be "{state}"     -->     backends_check_backend_state_by_index

"""
from behave import *
from time import sleep, time

from general import time_vslow, time_fast, time_mid, time_slow

@when(u'I use my "{provider}" credentials')
def backends_use_credentials(context, provider):
    creds = context.personas['NinjaTester']['creds']
    print creds
    if provider == "EC2":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['EC2']['api_key'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['EC2']['api_secret'])
        return
    elif provider =="RACKSPACE":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Rackspace']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Rackspace']['api_key'])
        return
    elif provider == "OPENSTACK":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Openstack']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Openstack']['password'])
        context.browser.find_by_css('input#new-backend-openstack-url').fill(creds['Openstack']['auth_url'])
        context.browser.find_by_css('input#new-backend-openstack-tenant').fill(creds['Openstack']['tenant'])
        return
    elif provider == "SOFTLAYER":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Softlayer']['api_key'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Softlayer']['api_secret'])
        return
    elif provider == "NEPHOSCALE":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Nephoscale']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Nephoscale']['password'])
        return
    elif provider =="LINODE":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Linode']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Linode']['api_key'])
        return
    elif provider =="BAREMETAL":
        context.browser.find_by_css('input#create-bareserver-ip').fill(BARE_HOSTNAME)
        context.browser.find_by_css('input#ROOTcreate-bareserver-user').fill(BARE_USER)
        context.execute_steps(u"""
        When I click the "Select Key" collapsible
        Then I should see a list from "Select Key" collapsible
        When I click "%s" from "Select Key" collapsible list
        And I wait for 2 seconds
        """ % BARE_KEY)
        return
    assert False, u'"%s" credentials not supported'


@then(u'I should see the "{backend}" Backend {state} within {timeout} seconds')
def backends_see_backend_buttons(context, backend, timeout, state):

    if state == "added":
        end_time = time() + int(timeout)
        while time() < end_time:
            backend_buttons_count = len(context.browser.find_by_css('#backend-buttons .ui-btn'))
            for i in range(backend_buttons_count):
                if context.browser.find_by_css('#backend-buttons .ui-btn')[i].text == backend.strip():
                    return
            sleep(2)
        assert False, u'%s backend in not added' % backend
    elif state == "deleted":
        end_time = time() + int(timeout)
        while time() < end_time:
            backend_buttons_count = len(context.browser.find_by_css('#backend-buttons .ui-btn'))
            if not backend_buttons_count:
                return
            for i in range(backend_buttons_count):
                if not context.browser.find_by_css('#backend-buttons .ui-btn')[i].text == backend.strip():
                    return
            sleep(2)
        assert False, u'%s backend in not deleted' % backend
    else:
        assert False, u'Backend state should be <added> or <deleted> and not %s' % state


@when(u'I change the name of the backend to "{new_name}"')
def rename_backend(context, new_name):
    try:
        context.browser.find_by_css('#edit-backend input.ui-input-text').fill(new_name)
    except:
        assert False, u'Could not fill in new name'


@when(u'I flip the backend switch')
def backends_flip_switch(context):
    state = context.browser.find_by_css('#backend-toggle').value
    context.browser.execute_script("$('#backend-toggle').val('%s' == '1' ? '0' : '1').slider('refresh').trigger('change')" % state)
    sleep(time_fast)


@then(u'"{backend}" backend should be "{state}"')
def backends_check_backend_state_by_index(context, backend, state):

    toggle_value = context.browser.find_by_css('#backend-toggle').value

    if state == "Enabled" and toggle_value == 1:
        return
    elif state == "Disabled" and toggle_value == 0:
        return
    else:
        assert False, u'Backend %s is not %s' % (backend, state)