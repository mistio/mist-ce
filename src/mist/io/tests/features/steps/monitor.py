"""
@given:
-------
a key for the monitored machine       --> given_key

@when:
------
I click the monitor key     --> click_key

@then:
------


------

"""


@given(u'a key for the monitored machine')
def given_key(context):
    key = context.personas['MonitorTester']['key_name']

    context.execute_steps(u"""
        When I click the "Keys" button
        And I wait for 2 seconds
        And I click the "Add" button
        And I type "%s" as key name
        And I click the "Generate" button
        And I click the "Done" button
            Then I should see the "%s" Key added within 5 seconds
    """ % (key, key))


@when(u'I click the monitor key')
def click_key(context):
    key = context.personas['MonitorTester']['key_name']
    context.execute_steps(u"""
    When I click the link with text that contains "%s"
    """ % key)