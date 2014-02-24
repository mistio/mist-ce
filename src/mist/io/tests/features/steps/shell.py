"""
@given:
-------

@when:
------
I type the "{command}" shell command        --> shell_command

@then:
------
I should see the "{command}" result in shell output     --> shell_output

------

"""
from behave import *

@when(u'I type the "{command}" shell command')
def shell_command(context, command):
    shell_input = context.browser.find_by_css('#shell-input input')
    shell_input.type(command)

    shell_enter = context.browser.find_by_css('#shell-submit .ui-btn')
    shell_enter.click()


@then(u'I should see the "{command}" result in shell output')
def shell_output(context, command):
    shell_output = context.browser.find_by_css('#shell-return h3')

    for output in shell_output:
        if command in output.text:
            return

    assert False, u'Could not find the output of %s command' % command