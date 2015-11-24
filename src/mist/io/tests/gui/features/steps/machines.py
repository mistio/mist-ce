import re
from random import randrange
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from mist.io.tests.gui.features.steps.general import *


@when(u'I check the sorting by "{sorting_param}"')
def check_sorting(context, sorting_param):
    """
    Create dict with key the arg of the step definition
    """

    sort_map = {'name': 'div.machine-name', 'state': 'span.machine-state',
                'cloud': 'div.machine-tags span.tag:nth-child(1)'}

    sort_type = sorting_param
    sorting_selector = sort_map[sort_type]

    machines_elements = context.browser.find_elements_by_css_selector(
        '#machine-list-container li ' + sorting_selector)
    # list with machine's names
    machines_names_list = [safe_get_element_text(machine_element) for
                           machine_element in machines_elements]
    # sorting the machine list
    my_sorted_machines_list = sorted(machines_names_list)
    # lists are sorted and they have the same number of elements
    if my_sorted_machines_list == machines_names_list:
        pass
    else:
        assert False, u'List is not sorted'


@when(u'I clear the machines search bar')
def clear_machines_search_bar(context):
    search_bar_machine = context.browser.find_element_by_css_selector(
        "div.machine-search-container "
        "input.machine-search")
    search_bar_machine.clear()


@when(u'I fill in a "{name}" for specific machine name')
def fill_specific_machine_name(context,name):
    textfield = context.browser.find_element_by_id("create-machine-name")
    specific_name = name
    textfield.send_keys(specific_name)
    sleep(1)


@when(u'I fill in a random machine name')
def fill_machine_mame(context):
    textfield = context.browser.find_element_by_id("create-machine-name")
    context.random_name = "testlikeapro%s" % randrange(10000)
    textfield.send_keys(context.random_name)
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
        if context.mist_config.get(name):
            machine_name = name
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
                if state in safe_get_element_text(machine):
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

    assert False, u'%s machine is not probed within %s seconds' % (
                    machine_name, seconds)


def get_machine(context, name):
    try:
        placeholder = context.browser.find_element_by_id("machine-list-page")
        machines = placeholder.find_elements_by_tag_name("li")

        for machine in machines:
            machine_text = safe_get_element_text(machine)
            if name in machine_text:
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
    key_name.send_keys(
        context.mist_config['CREDENTIALS'][new_key_name]['key_name'])
    upload = context.browser.find_element_by_id("key-add-upload")
    upload.send_keys(
        context.mist_config['CREDENTIALS'][new_key_name]['key_path'])
    context.execute_steps(u'When I click the button "Add"')


@then(u'I wait for probing to finish for {seconds} seconds max')
def wait_for_loader_to_finish(context, seconds):
    rows = context.browser.find_elements_by_tag_name('tr')
    for row in rows:
        cells = row.find_elements_by_tag_name('td')
        cells_text = safe_get_element_text(cells[0])
        if cells_text == 'Last probed':
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
        div_text = safe_get_element_text(div)
        if div_text == 'Cannot connect as root on port 22':
            raise ValueError('Could not connect with server with ssh key')
    except NoSuchElementException:
        pass


@then(u'probing was successful')
def check_probing(context):
    rows = context.browser.find_elements_by_tag_name('tr')
    for row in rows:
        cells = row.find_elements_by_tag_name('td')
        cells_zero_text = safe_get_element_text(cells[0])
        if cells_zero_text == 'Last probed':
            cells_one_text = safe_get_element_text(cells[1])
            message = cells_one_text.split('\n')[0].lower()
            assert message == 'just now', "Probing of machine failed" \
                                          "(message is: %s)" % cells_one_text
            return
    assert False, "Could not find any line about probing"


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


def update_lines(terminal, lines):
    """
    Cleans up the terminal from empty lines and marks down the last empty line.
    """
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
    return len(lines)


def update_single_line(terminal, lines, index):
    assert index >= 0 and index < len(lines), "Wrong single line index %s" % index
    all_lines = terminal.find_elements_by_tag_name('div')
    all_lines_text = safe_get_element_text(all_lines[index])
    lines[index] = safe_get_element_text(all_lines_text).rstrip().lstrip()


@then(u'I test the ssh connection')
def check_ssh_connection(context):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    get some output.
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
        if re.search(":~#$", lines[-1]):
            break
        assert time() + 1 < connection_max_time, "Error while connecting"
        sleep(1)

    expected_command_output = len(lines)
    terminal.send_keys("ls -l\n")
    # terminal.send_keys("ls -l\n")
    command_end_time = time() + 20
    # waiting for command output to be returned
    while time() < command_end_time:
        update_lines(terminal, lines)
        if len(lines) > expected_command_output and re.search(":~#$", lines[-1]):
            update_single_line(terminal, lines, expected_command_output - 1)
            assert re.search("total\s\d{1,3}", lines[expected_command_output]), \
                "Error while waiting for command output"
            context.browser.find_element_by_id('shell-back').click()
            return
        sleep(1)
    assert False, "Command output took too long"


@then(u'I search for the "{text}" Machine')
def search_image(context, text):
    if text == 'randomly_created':
        text = context.random_name
    search_for_something(context, text, 'machine')
