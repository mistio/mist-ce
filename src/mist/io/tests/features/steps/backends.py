"""
@given:
-------

@when:
------
And I use my "{provider}" credentials   --> backends_use_credentials

@then:
------
I should see the "{backend}" Backend added within {timeout} seconds    --> backends_see_backend_buttons

"""
from behave import *
from time import sleep, time

@when(u'I use my "{provider}" credentials')
def backends_use_credentials(context, provider):
    creds = context.personas['NinjaTester']['creds']
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


@then(u'I should see the "{backend}" Backend added within {timeout} seconds')
def backends_see_backend_buttons(context, backend, timeout):
    end_time = time() + int(timeout)
    while time() < end_time:
        backend_buttons_count = len(context.browser.find_by_css('#backend-buttons .ui-btn'))
        for i in range(backend_buttons_count):
            if context.browser.find_by_css('#backend-buttons .ui-btn')[i].text == backend.strip():
                return
        sleep(2)

    assert False, u'%s backend in not added' % backend