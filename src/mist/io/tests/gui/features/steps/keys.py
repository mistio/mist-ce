from behave import *
from time import time, sleep


@when(u'I fill "{text}" as key name')
def fill_key_name(context, text):
    if "randomly_created" in text:
        text = context.random_name

    textfield = context.browser.find_element_by_id("key-add-id")
    textfield.send_keys(text)
    # for letter in text:
    #     textfield.send_keys(letter)


@when(u'I fill "{text}" as new key name')
def fill_key_name(context, text):
    if "randomly_created" in text:
        text = context.random_name

    textfield = context.browser.find_element_by_id("new-key-name")
    for i in range(20):
        textfield.send_keys(u'\ue003')

    for letter in text:
        textfield.send_keys(letter)


@then(u'Keys counter should be greater than {counter_number} within {seconds} seconds')
def keys_counter_loaded(context, counter_number, seconds):
    elements = context.browser.find_elements_by_tag_name("li")
    for element in elements:
        if "Keys" in element.text:
            break

    end_time = time() + int(seconds)
    while time() < end_time:
        counter_span = element.find_element_by_tag_name("span")
        counter = int(counter_span.text)

        if counter > int(counter_number):
            return
        else:
            sleep(2)

    assert False, u'The counter did not say that more than %s keys were loaded' % counter_number


@then(u'"{text}" key should be added within {seconds} seconds')
def key_added(context, text, seconds):
    if "randomly_created" in text:
        text = context.random_name

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
    if "randomly_created" in text:
        text = context.random_name

    keys = context.browser.find_elements_by_css_selector(".ui-listview li")
    for key in keys:
        if text in key.text:
            assert False, u'%s Key is not deleted'

    return
