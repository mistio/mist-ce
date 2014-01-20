"""
@given:
-------

@when:
------
I type a key name       --> type_key_name

@then:
------
Then I should see the Key added within 5 seconds    -->  key_see_buttons

"""

@when(u'I type a key name')
def type_key_name(context):
    key = context.personas['NinjaTester']['key_name']
    context.browser.find_by_css('input#create-key-id').fill(key)


@then(u'I should see the Key added within 5 seconds')
def key_see_buttons(context):
    keys = context.browser.find_by_css('.ui-listview li')
    for key in keys:
        if context.personas['NinjaTester']['key_name'] in key.text.strip():
            return

    assert False, u'%s in not found in added Keys' % context.personas['NinjaTester']['key_name']