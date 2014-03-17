"""
@given:
-------
an "{name}" backend     --> given_backend

@when:
------
And I use my "{provider}" credentials   --> backends_use_credentials
I change the name of the backend to "{new_name}"    --> rename_backend
I flip the backend switch       --> backends_flip_switch

@then:
------
I should see the "{backend}" Backend added within {timeout} seconds    --> backends_see_backend_buttons
"{name}" backend should be "{state}"     -->     backends_check_backend_state_by_index

"""
from behave import *
from time import sleep, time

from general import time_vslow, time_fast, time_mid, time_slow


@given(u'an "{name}" backend')
def given_backend(context, name):
    if "EC2" in name:
        context.execute_steps(u"""
        When I click the "Add backend" button
        And I click the "Select provider" button
        And i click the "%s" button
        And I use my "%s" credentials
        And I click the "Add" button
        And I wait for 1 seconds
            Then I should see the "%s" Backend added within 30 seconds
        """ % ("EC2 AP NORTHEAST", "EC2", "EC2 AP NORTHEAST"))

    assert False, u"Could not execute Add Backend Scenario"

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
        context.browser.find_by_css('input#new-backend-first-field').type(creds['Softlayer']['api_key'])
        context.browser.find_by_css('input#new-backend-second-field').type(creds['Softlayer']['api_secret'])
        return
    elif provider == "NEPHOSCALE":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Nephoscale']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Nephoscale']['password'])
        return
    elif provider == "LINODE":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['Linode']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['Linode']['api_key'])
        return
    elif provider == "HPCLOUD":
        context.browser.find_by_css('input#new-backend-first-field').fill(creds['HPCloud']['username'])
        context.browser.find_by_css('input#new-backend-second-field').fill(creds['HPCloud']['password'])
        context.browser.find_by_css('input#new-backend-openstack-tenant').fill(creds['HPCloud']['tenant'])
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
    name = list(new_name)
    try:
        context.browser.find_by_css('#edit-backend-popup input').fill("")
        for letter in name:
            context.browser.find_by_css('#edit-backend-popup input').type(letter)
            sleep(2)
    except:
        assert False, u'Could not change name or popup is not open'


@when(u'I flip the backend switch')
def backends_flip_switch(context):
    context.browser.find_by_css('#edit-backend-popup').find_by_css('a.ui-slider-handle').click()
    #context.browser.execute_script("$('#backend-toggle').val('%s' == '1' ? '0' : '1').slider('refresh').trigger('change')" % state)
    #sleep(time_fast)


@then(u'"{name}" backend should be "{state}"')
def backends_check_backend_state_by_index(context, name, state):

    # toggle_value = context.browser.find_by_css('#backend-toggle').value

    buttons = context.browser.find_by_css('#backend-buttons .ui-btn')
    for button in buttons:
        if name in button.text:
            break

    if state == "offline":
        if button.has_class('ui-icon-offline'):
            return
    else:
        if button.has_class('ui-icon-online') or button.has_class('ui-icon-check')\
                or button.has_class('ui-icon-waiting'):
            return

    assert False, u'%s is not %s' % (name, state)

    # if state == "Enabled" and toggle_value == 1:
    #     return
    # elif state == "Disabled" and toggle_value == 0:
    #     return
    # else:
    #     assert False, u'Backend %s is not %s' % (backend, state)
