from behave import *
from time import time, sleep


@when(u'I fill "{text}" as key name')
def fill_key_name(context, text):
    textfield = context.browser.find_element_by_id("add-key-id")
    for letter in text:
        textfield.send_keys(letter)


@when(u'I fill "{text}" as new key name')
def fill_key_name(context, text):
    textfield = context.browser.find_element_by_id("new-key-name")
    for i in range(20):
        textfield.send_keys(u'\ue003')

    for letter in text:
        textfield.send_keys(letter)


@then(u'"{text}" key should be added within {seconds} seconds')
def key_added(context, text, seconds):
    end_time = time() + int(seconds)
    while time() < end_time:
        keys = context.browser.find_elements_by_css_selector(".ui-listview li")
        for key in keys:
            if text in key.text:
                return
        sleep(2)

    assert False, u'%s Key is not found added within %s seconds' % (text, seconds)


@then(u'"{text}" key should be deleted')
def key_deleted(context, text):
    keys = context.browser.find_elements_by_css_selector(".ui-listview li")
    for key in keys:
        if text in key.text:
            assert False, u'%s Key is not deleted'

    return