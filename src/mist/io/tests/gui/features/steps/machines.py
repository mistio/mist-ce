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


@then(u'I search for the "{text}" Machine')
def search_image(context, text):
    if context.mist_config.get(text):
        text = context.mist_config.get(text)
    search_for_something(context, text, 'machine')
