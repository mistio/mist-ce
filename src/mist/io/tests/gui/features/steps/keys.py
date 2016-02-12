from behave import *
from time import time, sleep
from mist.io.tests.gui.features.steps.general import safe_get_element_text


@when(u'I fill "{text}" as key name')
def fill_key_name(context, text):
    if context.mist_config.get(text):
        text = context.mist_config.get(text)

    textfield = context.browser.find_element_by_id("key-add-id")
    textfield.send_keys(text)


@when(u'I fill "{text}" as new key name')
def fill_key_name(context, text):
    if context.mist_config.get(text):
        text = context.mist_config.get(text)

    textfield = context.browser.find_element_by_id("new-key-name")
    for i in range(20):
        textfield.send_keys(u'\ue003')

    for letter in text:
        textfield.send_keys(letter)


@then(u'"{text}" key should be added within {seconds} seconds')
def key_added(context, text, seconds):
    if context.mist_config.get(text):
        text = context.mist_config.get(text)

    end_time = time() + int(seconds)
    while time() < end_time:
        keys = context.browser.find_elements_by_css_selector(".ui-listview li")
        for key in keys:
            if text in safe_get_element_text(key):
                return
        sleep(2)

    assert False, u'%s Key is not found added within %s seconds' % (text, seconds)


@then(u'"{text}" key should be deleted')
def key_deleted(context, text):
    if context.mist_config.get(text):
        text = context.mist_config.get(text)

    keys = context.browser.find_elements_by_css_selector(".ui-listview li")
    for key in keys:
        if text in safe_get_element_text(key):
            assert False, u'%s Key is not deleted'


@step(u'I add new machine key with name "{key_name}" or I select it')
def add_or_select_key(context, key_name):
    if context.mist_config.get(key_name):
        key_name = context.mist_config.get(key_name)

    keys = context.browser.find_element_by_id('key').find_elements_by_tag_name('li')
    for key in keys:
        if key_name == safe_get_element_text(key):
            key.click()
            return

    context.execute_steps(u'''
        When I click the "Add Key" button inside the "Create Machine" panel
        Then I expect for "key-add-popup" popup to appear within max 4 seconds
        When I fill "%s" as key name
        And I click the "Generate" button inside the "Add key" popup
        Then I expect for "key-generate-loader" loader to finish within max 10 seconds
        When I click the "Add" button inside the "Add key" popup
        Then I expect for "key-add-popup" popup to disappear within max 4 seconds
    ''' % key_name)
