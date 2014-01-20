"""
@given:
-------

@when:
------
I type a key name       --> type_key_name
I click the "{name}" Key      --> click_key
I fill in "{name}" as Key name      --> rename_key

@then:
------
I should see the "{name}" Key added within 5 seconds    -->  key_see_buttons

"""

tester_key_name = ""

@when(u'I type a key name')
def type_key_name(context):
    key = context.personas['NinjaTester']['key_name']
    context.browser.find_by_css('input#create-key-id').fill(key)
    global tester_key_name
    tester_key_name = key

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

@then(u'I should see the "{name}" Key added within 5 seconds')
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

    assert False, u'%s in not found in added Keys' % context.personas['NinjaTester']['key_name']


@when(u'I fill in "{name}" as Key name')
def rename_key(context, name):
    context.browser.find_by_css('input#new-key-name').fill(name)
