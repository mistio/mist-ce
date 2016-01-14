import re

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException

from mist.io.tests.gui.features.steps.general import *


@given(u'ssh key with name "{ssh_key_name}" is added')
def ssh_key_is_added(context, ssh_key_name):
    # first we have to find the keys button
    buttons = context.browser.find_elements_by_class_name('ui-btn')
    for button in buttons:
        button_text = safe_get_element_text(button)
        if 'add key' in button_text.lower():
            # if there no keys then it will be called "Add key"
            context.execute_steps(u"""
                Then I click the button "Add key"
                And I expect for "non-associated-keys-popup-popup" popup to appear within max 4 seconds
            """)
            # check if the key is already uploaded but not associated
            key_already_associated = False
            non_associated_keys = context.browser.find_element_by_id('non-associated-keys-popup').find_elements_by_tag_name('li')
            for non_associated_key in non_associated_keys:
                if context.mist_config['CREDENTIALS'][ssh_key_name]['key_name'].lower() in safe_get_element_text(non_associated_key).lower():
                    non_associated_key.click()
                    key_already_associated = True
                    break

            if not key_already_associated:
                context.execute_steps(u"""
                    When I click the "New key" button inside the "Add key" popup
                    Then I expect for "key-add-popup" popup to appear within max 2 seconds
                    And I upload the ssh key with name "%s"
                """ % ssh_key_name)

            context.execute_steps(u"""
                Then I expect for "machine-keys-panel" side panel to appear within max 4 seconds
                And I expect for "machine-associating-key-loader" loader to finish within max 100 seconds
                Then If the key addition was successful
            """)
            context.browser.find_elements_by_class_name('ui-panel-dismiss')[0].click()
            return
        elif 'keys' in button_text.lower():
            # otherwise it will be called "? keys" where ? is the number of
            # saved keys. before adding the key we need to check if it's already
            # saved
            context.execute_steps(u'''
                Then I click the button "%s"
                And I expect for "machine-keys-panel" side panel to appear within max 4 seconds
            ''' % safe_get_element_text(button))
            machine_keys_list = context.browser.find_element_by_id("machine-keys")
            machines_keys = machine_keys_list.find_elements_by_class_name(
                "small-list-item")
            checked_texts = []
            for machines_key in machines_keys:
                machines_key_text = safe_get_element_text(machines_key)
                if not machines_key_text or not machines_key_text.strip():
                    # sometimes the code checks for the texts too fast and they
                    # haven't been fetched yet so we do a sleep
                    sleep(1)
                checked_texts.append(machines_key_text)
                if context.mist_config['CREDENTIALS'][ssh_key_name]['key_name']\
                        in machines_key_text:
                    context.browser.find_elements_by_class_name('ui-panel-dismiss')[0].click()
                    context.execute_steps(u'Then I expect for "machine-keys-panel" side panel to disappear within max 4 seconds')
                    return
            context.execute_steps(u"""
                When I click the "New key" button inside the "Manage Keys" panel
                And I expect for "non-associated-keys-popup" popup to appear within max 4 seconds
            """)
            # check if the key is already uploaded but not associated
            key_already_associated = False
            non_associated_keys = context.browser.find_element_by_id('non-associated-keys-popup').find_elements_by_tag_name('li')
            for non_associated_key in non_associated_keys:
                if context.mist_config['CREDENTIALS'][ssh_key_name]['key_name'].lower() in safe_get_element_text(non_associated_key).lower():
                    non_associated_key.click()
                    key_already_associated = True
                    break

            if not key_already_associated:
                context.execute_steps(u"""
                    When I click the "New key" button inside the "Add Key" popup
                    Then I expect for "key-add-popup" popup to appear within max 2 seconds
                    And I upload the ssh key with name "%s"
                """ % ssh_key_name)

            context.execute_steps(u"""
                Then I expect for "key-generate-loader" loader to finish within max 5 seconds
                And I expect for "machine-associating-key-loader" loader to finish within max 100 seconds
                And If the key addition was successful
            """)
            context.browser.find_elements_by_class_name('ui-panel-dismiss')[0].click()
            context.execute_steps(u'Then I expect for "machine-keys-panel" side panel to disappear within max 4 seconds')


def is_ssh_connection_up(lines):
    errors = ['disconnected', 'timeout', 'timed out', 'closure', 'broken']
    for line in lines:
        for error in errors:
            if error in line.lower():
                return False
    return True


def update_lines(terminal, lines):
    """
    Cleans up the terminal from empty lines and marks down the last empty line.
    """
    starting_lines = len(lines)
    all_lines = terminal.find_elements_by_tag_name('div')
    safety_counter = max_safety_count = 5
    for i in range(len(lines), len(all_lines)):
        all_lines_text = safe_get_element_text(all_lines[i])
        line = all_lines_text.rstrip().lstrip()
        if line:
            for j in range(0, max_safety_count - safety_counter):
                lines.append(" ")
            lines.append(line)
        safety_counter = safety_counter - 1 if not line else max_safety_count
        if safety_counter == 0:
            break
    return starting_lines < len(lines)


def check_ssh_connection_with_timeout(context, connection_timeout=200):
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

    connection_max_time = time() + connection_timeout
    lines = []

    # waiting for input to become available
    while time() < connection_max_time:
        if update_lines(terminal, lines):
            assert is_ssh_connection_up(lines), "Error while using shell"
            if re.search(":~#$", lines[-1]):
                break
        assert time() + 1 < connection_max_time, "Shell hasn't connected after"\
                                                 "%s seconds. Aborting!"\
                                                 % connection_timeout
        sleep(1)

    terminal.send_keys("ls -l\n")
    command_input_line = len(lines) - 1
    # terminal.send_keys("ls -l\n")
    command_end_time = time() + 20
    # waiting for command output to be returned
    while time() < command_end_time:
        # if the command output has finished being printed
        if update_lines(terminal, lines):
            assert is_ssh_connection_up(lines), "Connection is broken"
            if re.search(":~#$", lines[-1]):
                for i in range(len(lines)-2, command_input_line, -1):
                    if re.search("total\s\d{1,3}", lines[i]):
                        return
        sleep(1)
    assert False, "Command output took too long"


@step(u'I test the ssh connection')
def check_ssh_connection(context):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    get some output.
    """
    check_ssh_connection_with_timeout(context)


@step('I test the ssh connection {times} times for max {seconds} seconds each'
      ' time')
def multi_ssh_test(context, times, seconds):
    assert int(times) > 0, "You should test ssh a positive number of times"
    for i in range(int(times)):
        assertion_error = None
        context.execute_steps(u'Then I click the button "Shell"')
        try:
            check_ssh_connection_with_timeout(context, int(seconds))
        except AssertionError as e:
            assertion_error = e
            if i == int(times) - 1:
                assert False, "Connection has not been established. Last error " \
                              "encountered was:\n%s" % repr(assertion_error)
        sleep(2)
        clicketi_click(context, context.browser.find_element_by_id('shell-back'))
        WebDriverWait(context.browser, 4).until(EC.invisibility_of_element_located((By.CLASS_NAME, 'terminal')))
        if not assertion_error:
            return


@then(u'I test the ssh connection and I check if my script succeeded')
def check_my_script(context):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    check if the script touch ~/kati succeeded by compare the file modification time.
    """
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

    connection_max_time = time() + 200
    lines = []

    # waiting for "Connecting bla bla bla" to be written
    while time() < connection_max_time:
        update_lines(terminal, lines)
        print(lines)
        if len(lines) > 0:
            assert re.match("Connecting\sto\s([0-9]{1,3}\.){4}\.\.", lines[0]),\
                "Shell is not connecting to server"
            break
        assert time() + 1 < connection_max_time, "Shell hasn't connected after"\
                                                 "60 seconds. Aborting!"
        sleep(1)

    # waiting for command input to become available
    while time() < connection_max_time:
        update_lines(terminal, lines)
        print(lines)
        if re.search(":~\$", lines[-1]):
            break
        assert time() + 1 < connection_max_time, "Error while connecting"
        sleep(1)

    expected_command_output = len(lines)
    terminal.send_keys("stat kati\n")
    command_end_time = time() + 20

    # check the modify time
    while time() < command_end_time:
        update_lines(terminal, lines)
        if len(lines) > expected_command_output and re.search(":~\$", lines[-1]):
            my_list=[]
            #search for modify time
            for i in range(0,len(lines)):
                if re.search("Modify", lines[i]):
                    modify_text =lines[i]
                    modify_text_t = modify_text.rstrip().lstrip()
                    my_list = modify_text_t.split()
                    break
            break

    expected_command_output_second = len(lines)
    terminal.send_keys('date +"%T"\n')

    # check the time now
    while time() < command_end_time:
        update_lines(terminal, lines)
        if len(lines) > expected_command_output_second and re.search(":~\$", lines[-1]):
            #search for time now
            for i in range(0,len(lines)):
                if re.search("^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$",lines[i]):
                    time_text = lines[i]
                    time_text_t = time_text.rstrip().lstrip()
                    #compare modify time and time now
                    if my_list[2] < time_text_t:
                        context.browser.find_element_by_id('shell-back').click()
                        return
    assert False, "Command output took too long"
