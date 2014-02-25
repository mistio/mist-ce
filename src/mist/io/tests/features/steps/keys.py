"""
@given:
-------

@when:
------
I type "{name}" as key name       --> type_key_name
I click the "{name}" Key      --> click_key
I fill in "{name}" as Key name      --> rename_key
I check the "{name}" key        --> check_key

@then:
------
I should see the "{name}" Key added within 5 seconds    -->  key_see_buttons
"{name}" should be the default key      --> check_default_key

"""
from behave import *
tester_key_name = ""

@when(u'I type "{name}" as key name')
def type_key_name(context, name):
    global tester_key_name
    if name == "tester":
        key = context.personas['NinjaTester']['key_name']
        context.browser.find_by_css('input#add-key-id').fill(key)
        tester_key_name = key
        return
    elif name == "monitor_tester":
        key = context.personas['MonitorTester']['key_name']
        context.browser.find_by_css('input#add-key-id').fill(key)
        tester_key_name = key
        return
    elif name == "shell_tester":
        key = context.personas['ShellTester']['key_name']
        context.browser.find_by_css('input#add-key-id').fill(key)
        tester_key_name = key
        return
    else:
        context.browser.find_by_css('input#add-key-id').fill(name)
        return

@when(u'I click the "{name}" Key')
def click_key(context, name):

    global tester_key_name
    if name == "tester":
        context.execute_steps(u"""
        When I click the "%s" button""" % tester_key_name)
        return
    else:
        context.execute.steps(u"""
        When I click the "%s" button""" % name)
        return

    assert False, u'Could not Click the key, either not found or css/html/javascript broken'

@then(u'I should see the "{name}" Key added within 10 seconds')
def key_see_buttons(context, name):

    global tester_key_name

    if name == "tester":
        keys = context.browser.find_by_css('.ui-listview li')
        for key in keys:
            if tester_key_name in key.text.strip():
                return
    else:
        keys = context.browser.find_by_css('.ui-listview li')
        for key in keys:
            if name in key.text.strip():
                return

    assert False, u'%s in not found in added Keys' % name


@when(u'I fill in "{name}" as Key name')
def rename_key(context, name):
    context.browser.find_by_css('input#new-key-name').fill(name)


@when(u'I check the "{name}" key')
def check_key(context, name):
    keys = context.browser.find_by_css('.ui-listview li')

    for key in keys:
        if name in key.text:
            break

    try:
        key.find_by_css('.ui-btn')[0].click()
    except:
        assert False, u'Could not check the checkbox for Key %s' % name


@then(u'"{name}" should be the default key')
def check_default_key(context, name):
    keys = context.browser.find_by_css('.ui-listview li')

    for key in keys:
        if name in key.text:
            break

    if "default" in key.find_by_css('.tag').text:
        return
    else:
        assert False, u'%s appears not to be the default one' % name

