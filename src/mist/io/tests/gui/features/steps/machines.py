import re
from random import randrange

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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


@when(u'I fill in a "{name}" machine name')
def fill_machine_mame(context, name):
    """
    This step will create a random machine name and a suitable name for an
    accompanying ssh key and will update the context.
    """
    if 'random' in name or context.mist_config.get(name):
        if not context.mist_config.get(name):
            if 'random ' in name:
                name = name.lstrip('random ')
            machine_name = context.mist_config[name] = "testlikeapro%s" % randrange(10000)
        else:
            machine_name = context.mist_config[name]
    else:
        machine_name = name
    textfield = context.browser.find_element_by_id("create-machine-name")
    textfield.send_keys(machine_name)
    context.mist_config[name + "_machine_key"] = machine_name + "_key"
    sleep(1)


@when(u'I choose the "{name}" machine')
def choose_machine(context, name):
    if context.mist_config.get(name):
        name = context.mist_config.get(name)

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
    if context.mist_config.get(name):
        name = context.mist_config.get(name)

    end_time = time() + int(seconds)
    while time() < end_time:
        machine = get_machine(context, name)
        if machine:
            return
        sleep(2)

    assert False, u'%s is not added' % name


@then(u'"{name}" machine state should be "{state}" within {seconds} seconds')
def assert_machine_state(context, name, state, seconds):
    if context.mist_config.get(name):
        name = context.mist_config.get(name)

    end_time = time() + int(seconds)
    while time() < end_time:
        machine = get_machine(context, name)
        if machine:
            try:
                if state in safe_get_element_text(machine):
                    return
            except NoSuchElementException:
                pass
            except StaleElementReferenceException:
                pass
        sleep(2)

    assert False, u'%s state is not "%s"' % (name, state)


@then(u'"{name}" machine should be probed within {seconds} seconds')
def assert_machine_probed(context, name, seconds):
    if context.mist_config.get(name):
        name = context.mist_config.get(name)

    end_time = time() + int(seconds)
    while time() < end_time:
        machine = get_machine(context, name)
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
                    name, seconds)


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


@then(u'I search for the "{text}" Machine')
def search_image(context, text):
    if context.mist_config.get(text):
        text = context.mist_config.get(text)
    search_for_something(context, text, 'machine')
