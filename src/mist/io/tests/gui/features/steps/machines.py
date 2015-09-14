import re
from behave import *
from time import time, sleep
from random import randrange
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException


@when(u'I fill in a random machine name')
def fill_machine_mame(context):
    textfield = context.browser.find_element_by_id("create-machine-name")
    random_name = "testlikeapro" + str(randrange(10000))
    for letter in random_name:
        textfield.send_keys(letter)
    context.random_name = random_name
    sleep(1)


@when(u'I choose the "{name}" machine')
def choose_machine(context, name):
    if "randomly_created" in name:
        name = context.random_name

    end_time = time() + 20
    while time() < end_time:
        machine = get_machine(context, name)
        if machine:
            checkbox = machine.find_element_by_class_name("ui-checkbox")
            checkbox.click()
            return

        sleep(2)
    assert False, u'Could not choose/tick %s machine' % name


@then(u'I should see the "{name}" machine added within {seconds} seconds')
def assert_machine_added(context, name, seconds):
    if "randomly_created" in name:
        machine_name = context.random_name
    else:
        machine_name = name

    end_time = time() + int(seconds)
    while time() < end_time:
        machine = get_machine(context, machine_name)
        if machine:
            return
        sleep(2)

    assert False, u'%s is not added' % name


@then(u'"{name}" machine state should be "{state}" within {seconds} seconds')
def assert_machine_state(context, name, state, seconds):
    if "randomly_created" in name:
        machine_name = context.random_name
    else:
        machine_name = name

    end_time = time() + int(seconds)
    while time() < end_time:
        machine = get_machine(context, machine_name)
        if machine:
            try:
                if state in machine.text:
                    return
            except NoSuchElementException:
                pass
            except StaleElementReferenceException:
                pass
        sleep(2)

    assert False, u'%s state is not "%s"' % (machine_name, state)


@then(u'"{name}" machine should be probed within {seconds} seconds')
def assert_machine_probed(context, name, seconds):
    if "randomly_created" in name:
        machine_name = context.random_name
    else:
        machine_name = name

    end_time = time() + int(seconds)
    while time() < end_time:
        machine = get_machine(context, machine_name)
        if machine:
            try:
                probed = machine.find_element_by_class_name("probed")
                return
            except NoSuchElementException:
                pass
            except StaleElementReferenceException:
                pass
            sleep(3)

    assert False, u'%s machine is not probed within %s seconds' % (machine_name, seconds)


def get_machine(context, name):
    try:
        placeholder = context.browser.find_element_by_id("machines")
        machines = placeholder.find_elements_by_tag_name("li")

        for machine in machines:
            if name in machine.text:
                return machine

        return None
    except NoSuchElementException:
        return None
    except StaleElementReferenceException:
        return None


@then(u'I upload the ssh key with name "{new_key_name}"')
def upload_my_key(context, new_key_name):
    end_time = time() + 15
    while time() < end_time:
        try:
            key_add_popup = context.browser.find_element_by_id('key-add-popup')
            display = key_add_popup.value_of_css_property("display")
            width = key_add_popup.value_of_css_property("width")
            if 'block' in display:
                if width != '1px':
                    break
            raise NoSuchElementException
        except NoSuchElementException:
            assert time() + 1 < end_time, 'Key add popup has not appeared ' \
                                          'after 5 seconds'
            sleep(1)
    key_name = context.browser.find_element_by_id("key-add-id")
    key_name.send_keys(context.mist_config['CREDENTIALS'][new_key_name]['key_name'])
    upload = context.browser.find_element_by_id("key-add-upload")
    upload.send_keys(context.mist_config['CREDENTIALS'][new_key_name]['key_path'])
    context.execute_steps(u'When I click the button "Add"')


@then(u'I wait for the ajax loader for max {seconds} seconds inside '
      u'"{element_id}"')
def wait_for_loader_to_finish(context, seconds, element_id):
    end_time = time() + int(seconds)
    while time() < end_time:
        try:
            panel = context.browser.find_element_by_id(element_id)
            panel.find_element_by_class_name('ajax-loader')
            sleep(1)
        except NoSuchElementException:
            return
    assert False, "Ajax loading hasn't finished after %s seconds" % seconds


@then(u'I wait for probing to finish for {seconds} seconds max')
def wait_for_loader_to_finish(context, seconds):
    rows = context.browser.find_elements_by_tag_name('tr')
    for row in rows:
        cells = row.find_elements_by_tag_name('td')
        if cells[0].text == 'Last probed':
            end_time = time() + int(seconds)
            while time() < end_time:
                try:
                    cells[1].find_element_by_class_name('ajax-loader')
                    sleep(1)
                except NoSuchElementException:
                    sleep(1)
                    return
            assert False, "Ajax loading hasn't finished after %s seconds" % seconds
    assert False, "Could not locate ajax loader"


@then(u'If the key addition was successful')
def success(context):
    try:
        popup = context.browser.find_element_by_id('machine-userPort-popup-popup')
        div = popup.find_element_by_class_name('message')
        if div.text == 'Cannot connect as root on port 22':
            raise ValueError('Could not connect with server with ssh key')
    except NoSuchElementException:
        pass


@then(u'probing was successful')
def check_probing(context):
    rows = context.browser.find_elements_by_tag_name('tr')
    for row in rows:
        cells = row.find_elements_by_tag_name('td')
        if cells[0].text == 'Last probed':
            message = cells[1].text.split('\n')[0].lower()
            assert message == 'just now', "Probing of machine failed" \
                                          "(message is: %s)" % cells[1].text
            return
    assert False, "Could not find any line about probing"


@given(u'ssh key with name "{ssh_key_name}" is added')
def ssh_key_is_added(context, ssh_key_name):
    # first we have to find the keys button
    buttons = context.browser.find_elements_by_class_name('ui-btn')
    for button in buttons:
        if 'Add key' in button.text:
            # if there no keys then it will be called "Add key"
            context.execute_steps(u"""
                Then I click the button "Add key"
                And I click the button "New key"
                Then I upload the ssh key with name "TESTING_MACHINE"
                And I wait for 5 seconds
                And I wait for the ajax loader for max 100 seconds inside "machine-keys-panel"
                Then If the key addition was successful
                And I click the button "Back"
            """)
            return
        elif re.search("\d{1,2}\skeys?", button.text):
            # otherwise it will be called "? keys" where ? is the number of
            # saved keys. before adding the key we need to check if it's already
            # saved
            context.execute_steps(u"""
                Then I click the button "%s"
            """ % button.text)
            try:
                machine_keys_list = context.browser.find_element_by_id("machine-keys")
                machines_keys = context.browser.find_elements_by_class_name("small-list-item")
                for machines_key in machines_keys:
                    if machines_key.text == context.mist_config['CREDENTIALS'][ssh_key_name]['key_name']:
                        return
            except NoSuchElementException:
                pass
            context.execute_steps(u"""
                Then I click the button "%s"
                And I click the button "New key"
                Then I upload the ssh key with name "%s"
                And I wait for 5 seconds
                And I wait for the ajax loader for max 100 seconds inside "machine-keys-panel"
                And If the key addition was successful
                Then I click the button "Back"
            """ % (button.text, ssh_key_name))


def update_lines(terminal, lines, start_of_empty_lines):
    """
    Cleans up the terminal from empty lines and marks down the last empty line.
    """
    new_lines = terminal.find_elements_by_tag_name('div')
    last_empty_line = start_of_empty_lines
    safety_counter = max_safety_count = 5
    for i in range(start_of_empty_lines, len(new_lines)):
        line = new_lines[i].text.lstrip().rstrip()
        last_empty_line = i if not line and safety_counter == max_safety_count \
            else last_empty_line
        safety_counter = max_safety_count if line else safety_counter - 1
        if line:
            lines.append(line)
        if safety_counter == 0:
            break
    return last_empty_line


@then(u'I test the ssh connection')
def check_ssh_connection(context):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    get some output.
    """
    # Disconnected from remote. WebSocket connection broken
    end_time = time() + 10
    terminal = None
    while time() < end_time:
        try:
            terminal = context.browser.find_elements_by_class_name('terminal')
            if len(terminal) > 0:
                terminal = terminal[0]
                break
            sleep(1)
        except NoSuchElementException:
            sleep(1)
    assert terminal, "Terminal has not opened 10 seconds after pressing the " \
                     "button. Aborting!"

    connection_max_time = time() + 100
    start_of_empty_lines = 0
    lines = []

    # waiting for "Connecting bla bla bla" to be written
    while time() < connection_max_time:
        first_empty_line = update_lines(terminal, lines, start_of_empty_lines)
        if start_of_empty_lines != first_empty_line:
            assert re.match("Connecting\sto\s([0-9]{1,3}\.){4}\.\.", lines[0]),\
                "Shell is not connecting to server"
            start_of_empty_lines = first_empty_line
            break
        assert time() + 1 < connection_max_time, "Shell hasn't connected after"\
                                                 "60 seconds. Aborting!"
        sleep(1)

    # waiting for command input to become available
    while time() < connection_max_time:
        start_of_empty_lines = update_lines(terminal, lines, start_of_empty_lines)
        if re.search(":~\$", lines[start_of_empty_lines - 1]):
            break
        assert time() + 1 < connection_max_time, "Error while connecting"
        sleep(1)

    terminal.send_keys("ls -l\n")
    command_end_time = time() + 20
    # waiting for command output to be returned
    while time() < command_end_time:
        first_empty_line = update_lines(terminal, lines, start_of_empty_lines)
        if start_of_empty_lines != first_empty_line:
            command_output_line = first_empty_line-1
            if re.search(":~\$", lines[command_output_line]):
                command_output_line -= 1
            assert lines[command_output_line] == 'total 0', "Error while " \
                                                            "waiting for " \
                                                            "command output"
            break
        assert time() + 1 < command_end_time, "Command output took too long"
        sleep(1)
    context.browser.find_element_by_id('shell-back').click()
