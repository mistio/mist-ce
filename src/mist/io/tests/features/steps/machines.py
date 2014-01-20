"""
@given:
-------
a key for the machine       --> given_key

@when:
------
I type "{name}" as machine name     --> type_machine_name

@then:

------

"""


@given(u'a key for the machine')
def given_key(context):
    key = context.personas['NinjaTester']['key_name']

    context.execute_steps(u"""
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "Create" button
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
