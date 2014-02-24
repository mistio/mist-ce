"""
@given:
-------
a key for the machine       --> given_key

@when:
------
I type "{name}" as machine name     --> type_machine_name
I click the "{name}" machine        --> click_machine
I add my bare metal creds       --> aad_bare_metal
I click the "{name}" from the associated keys       --> click_associated_key
I tick the "{name}" machine     --> tick_machine

@then:
------
"{machine_name}" state should be "{state}" within {timeout} seconds      --> check_machine_state
"{machine_name}" should be probed within {timeout} seconds      --> check_probed
I should find the Public IP     --> find_ip
I should see the Bare Metal Backend added within {timeout} seconds      --> see_bare_added
I should see {number} keys associated within {timeout} seconds   --> keys_associated

------

"""
from time import sleep, time
from behave import *

ip = ""

@given(u'a key for the machine')
def given_key(context):
    key = context.personas['NinjaTester']['key_name']

    try:
        context.execute_steps(u"""
            When I wait for 2 seconds
            And I click the "Add" button
            And I wait for 5 seconds
            And I type "%s" as key name
            And I click the "Generate" button
            And I wait for 5 seconds
            And I click the "Add" button within "add-key-popup" panel
            And I wait for 5 seconds
                Then I should see the "%s" Key added within 10 seconds
        """ % (key, key))
        return
    except Exception as e:
        context.execute_steps(u"""
            When I wait for 2 seconds
            And I click the "Add" button
            And I wait for 5 seconds
            And I type "%s" as key name
            And I click the "Generate" button
            And I wait for 5 seconds
            And I click the "Add" button within "add-key-popup" panel
            And I wait for 5 seconds
                Then I should see the "%s" Key added within 10 seconds
        """ % (key, key))
        return

    assert False, u'Could not create key for the machine, got %s exception' % e

@when(u'I type "{name}" as machine name')
def type_machine_name(context, name):
    if name == "tester":
        machine_name = context.personas['NinjaTester']['machine_name']
        context.browser.find_by_css('input#create-machine-name').fill(machine_name)
    elif name == "monitor_tester":
        machine_name = context.personas['MonitorTester']['machine_name']
        context.browser.find_by_css('input#create-machine-name').fill(machine_name)
    elif name == "shell_tester":
        machine_name = context.personas['ShellTester']['machine_name']
        context.browser.find_by_css('input#create-machine-name').fill(machine_name)
    else:
        context.browser.find_by_css('input#create-machine-name').fill(name)


@then(u'"{machine_name}" state should be "{state}" within {timeout} seconds')
def check_machine_state(context, machine_name, state, timeout):
    if machine_name == "tester":
        machine_name = context.personas['NinjaTester']['machine_name']
    elif machine_name == "monitor_tester":
        machine_name = context.personas['MonitorTester']['machine_name']
    elif machine_name == "shell_tester":
        machine_name = context.personas['ShellTester']['machine_name']



    end_time = time() + int(timeout)
    while time() < end_time:
        try:
            machines = context.browser.find_by_css('#machines li')
            for machine in machines:
                if machine_name in machine.text:
                    break
            if state in machine.text:
                return
            sleep(2)
        except:
            sleep(5)
            machines = context.browser.find_by_css('#machines li')
            for machine in machines:
                if machine_name in machine.text:
                    break
            if state in machine.text:
                return

    assert False, u'Could not find %s state for machine %s' % (state, machine_name)


@then(u'"{machine_name}" should be probed within {timeout} seconds')
def check_probed(context, machine_name, timeout):

    if machine_name == "tester":
        machine_name = context.personas['NinjaTester']['machine_name']
    elif machine_name == "monitor_tester":
        machine_name = context.personas['MonitorTester']['machine_name']
    elif machine_name == "shell_tester":
        machine_name = context.personas['ShellTester']['machine_name']


    end_time = time() + int(timeout)
    while time() < end_time:
        try:
            machines = context.browser.find_by_css('#machines li')
            for machine in machines:
                if machine_name in machine.text:
                    break

            leds = machine.find_by_css('a .machine-leds > div')
            if leds.has_class('probed'):
                return
        except:
            sleep(5)
            machines = context.browser.find_by_css('#machines li')
            for machine in machines:
                if machine_name in machine.text:
                    break
            leds = machine.find_by_css('a .machine-leds > div')

        sleep(2)

    assert False, u'%s machine is not probed within %s seconds' % (machine_name, timeout)


@when(u'I click the "{name}" machine')
def click_machine(context, name):
    if name == "tester":
        context.execute_steps(u"""
        When I click the "%s" button
        """ % context.personas['NinjaTester']['machine_name'])
    elif name == "monitor_tester":
        context.execute_steps(u"""
        When I click the "%s" button
        """ % context.personas['MonitorTester']['machine_name'])
    elif name == "shell_tester":
        context.execute_steps(u"""
        When I click the "%s" button
        """ % context.personas['ShellTester']['machine_name'])

@then(u'I should find the Public IP')
def find_ip(context):
    global ip
    try:
        infos = context.browser.find_by_css('.ui-collapsible tr td')

        for i in range(len(infos)):
            if "Public" in infos[i].text:
                ip = infos[i+1].text
    except:
        sleep(2)
        infos = context.browser.find_by_css('.ui-collapsible tr td')

        for i in range(len(infos)):
            if "Public" in infos[i].text:
                ip = infos[i+1].text


@when(u'I add my bare metal creds')
def aad_bare_metal(context):
    global ip
    hostname = ip
    key = context.personas['NinjaTester']['key_name']

    context.browser.find_by_css('input#new-backend-first-field').fill(hostname)
    context.browser.find_by_css('input#new-backend-second-field').fill("ec2-user")


@then(u'I should see the Bare Metal Backend added within {timeout} seconds')
def see_bare_added(context, timeout):
    global ip

    hostname = ip
    context.execute_steps(u"""
    Then I should see the "%s" Backend added within %s seconds
    """ % (hostname, timeout))


@then(u'I should see {number} keys associated within {timeout} seconds')
def keys_associated(context, number, timeout):

    end_time = time() + int(timeout)
    while time() < end_time:
        keys = context.browser.find_by_css('#machine-keys-panel ul .small-list-item')
        if len(keys) == int(number):
            return

    assert False, u'Could not find %s keys associated' % number


@when(u'I click the "{name}" from the associated keys')
def click_associated_key(context, name):
    keys = context.browser.find_by_css('#machine-keys-panel ul .small-list-item')

    for key in keys:
        if name in key.text:
            key.click()
            return

    assert False, u'Could not find/click the %s key' % name


@when(u'I tick the "{name}" machine')
def tick_machine(context, name):
    if name == "tester":
        machine_name = context.personas['NinjaTester']['machine_name']
    else:
        machine_name = name

    machines = context.browser.find_by_css('.ui-listview li')

    for machine in machines:
        if machine_name in machine.text.strip():
            break

    try:
        if machine_name in machine.text.strip():
            machine.find_by_css('.ui-btn')[0].click()
        else:
            machines = context.browser.find_by_css('.ui-listview li')

            for machine in machines:
                if machine_name in machine.text.strip():
                    break
            machine.find_by_css('.ui-btn')[0].click()
    except:
        assert False, u'Could not tick/check %s machine' % machine_name