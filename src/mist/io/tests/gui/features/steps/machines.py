from behave import *

from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException

from time import time, sleep
from random import randrange


@when(u'I fill in a random machine name')
def fill_machine_mame(context):
    textfield = context.browser.find_element_by_id("create-machine-name")
    random_name = "TESTLIKEAPRO" + str(randrange(10000))
    for letter in random_name:
        textfield.send_keys(letter)
    context.random_name = random_name


@when(u'I choose the "{name}" machine')
def choose_machine(context, name):
    if "randomly_created" in name:
        name = context.random_name

    machine = get_machine(context, name)
    checkbox = machine.find_element_by_class_name("ui-checkbox")
    checkbox.click()


@then(u'I should see the "{name}" machine added within {seconds} seconds')
def assert_machine_added(context, name, seconds):
    if "randomly_created" in name:
        machine_name = context.random_name
    else:
        machine_name = name

    end_time = time() + int(seconds)
    while time() < end_time:
        placeholder = context.browser.find_element_by_id("machines")
        machines = placeholder.find_elements_by_tag_name("li")

        for machine in machines:
            if machine_name in machine.text:
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
            except NoSuchElementException, StaleElementReferenceException:
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
            except NoSuchElementException, StaleElementReferenceException:
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
    except NoSuchElementException, StaleElementReferenceException:
        return None