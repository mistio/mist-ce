"""
@given:
-------
a key for the machine       --> given_key

@when:
------
I type "{name}" as machine name     --> type_machine_name
I click the "{name}" machine        --> click_machine
I add my bare metal creds       --> aad_bare_metal

@then:
"{machine_name}" state should be "{state}" within {timeout} seconds      --> check_machine_state
"{machine_name}" should be probed within {timeout} seconds      --> check_probed
I should find the Public IP     --> find_ip

------

"""
from time import sleep, time

ip=""

@given(u'a key for the machine')
def given_key(context):
    key = context.personas['NinjaTester']['key_name']

    context.execute_steps(u"""
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "Add" button
        And I type "%s" as key name
        And I click the "Generate" button
        And I click the "Done" button
            Then I should see the "%s" Key added within 5 seconds
    """ % (key, key) )


@when(u'I type "{name}" as machine name')
def type_machine_name(context, name):
    if name == "tester":
        machine_name = context.personas['NinjaTester']['machine_name']
        context.browser.find_by_css('input#create-machine-name').fill(machine_name)
    else:
        context.browser.find_by_css('input#create-machine-name').fill(name)


@then(u'"{machine_name}" state should be "{state}" within {timeout} seconds')
def check_machine_state(context, machine_name, state, timeout):
    machines = context.browser.find_by_css('#machines li')
    for machine in machines:
        if machine_name in machine.text:
            break

    end_time = time() + int(timeout)
    while time() < end_time:
        if state in machine.text:
            return
        sleep(2)

    assert False, u'Could not find %s state for machine %s' % (state, machine_name)


@then(u'"{machine_name}" should be probed within {timeout} seconds')
def check_probed(context, machine_name, timeout):
    machines = context.browser.find_by_css('#machines li')
    for machine in machines:
        if machine_name in machine.text:
            break

    leds = machine.find_by_css('a .machine-leds > div')
    end_time = time() + int(timeout)
    while time() < end_time:
        try:
            if leds.has_class('probed'):
                return
        except:
            machines = context.browser.find_by_css('#machines li')
            for machine in machines:
                if machine_name in machine.text:
                    break
            leds = machine.find_by_css('a .machine-leds > div')

        sleep(2)

    assert False, u'%s machine is not probed within %s seconds' % (machine_name, timeout)


@when(u'I click the "{name}" machine')
def click_machine(context, name):
    context.execute_steps(u"""
    When I click the "%s" button
    """ % context.personas['NinjaTester']['machine_name'])


@then(u'I should find the Public IP')
def find_ip(context):
    global ip
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