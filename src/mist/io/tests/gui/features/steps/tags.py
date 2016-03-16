from selenium.webdriver.remote.webelement import *
from mist.io.tests.gui.features.steps.general import *


@step(u'I remove all the previous tags')
def delete_previous_tags(context):
    tags_holder = context.browser.find_element_by_id("machine-tags-popup")
    tags = tags_holder.find_elements_by_css_selector(".tag-item")
    for tag in tags:
        tag_input = tag.find_elements_by_css_selector("input")
        textfield_key = tag_input[0]
        textfield_value = tag_input[1]
        textfield_key_text = safe_get_element_text(textfield_key)
        textfield_value_text = safe_get_element_text(textfield_value)
        if textfield_key_text != " " and textfield_value_text != " ":
            textfield_value.clear()
            textfield_key.clear()
        else:
            pass


@step(u'I name a "{key}" key and a "{value}" value for a tag')
def fill_another_tag_name(context,key,value):
    tags_holder = context.browser.find_element_by_id("machine-tags-popup")
    tags = tags_holder.find_elements_by_css_selector(".tag-item")
    tag = tags[-1]
    tag_input = tag.find_elements_by_css_selector("input")
    textfield_key = tag_input[0]
    textfield_value =tag_input[1]
    textfield_key.send_keys(key)
    textfield_value.send_keys(value)


@step(u'I close one of my tags')
def close_a_tag(context):
    close_tag = context.browser.find_element_by_css_selector(".tag-item "
                                                            "a.ui-btn.icon-xx.ui-btn-icon-notext")
    close_tag.click()
    sleep(1)


@step(u'I close the tag with key "{key}"')
def close_a_tag(context, key):
    tags = context.browser.find_elements_by_class_name("tag-item")
    for tag in tags:
        inputs = tag.find_elements_by_tag_name('input')
        for input in inputs:
            if input.get_attribute('placeholder').lower() == 'key':
                if input.get_attribute('value').lower() == key.lower():
                    close_button = tag.find_element_by_css_selector("a.ui-btn.icon-xx.ui-btn-icon-notext")
                    close_button.click()
                    sleep(1)
                    return
                else:
                    break


@step(u'I check if the "{my_key}" key and "{my_value}" value appear for the '
      u'machine')
def check_the_tags(context, my_key, my_value):
    check_tags = context.browser.find_elements_by_css_selector("#single-machine-info div.tag.pairs")
    words = []
    for tag in check_tags:
        tag_text = safe_get_element_text(tag)
        tag_lst = tag_text.split("=")
        words.append(tag_lst)
    if [my_key,my_value] in words:
        pass
    else:
        assert False, u'tag is not pair of %s key and %s value' % (my_key,
                                                                   my_value)


@step(u'the "{name}" machine in the list should have a tag with key "{key}"'
      u' and value "{value}"')
def check_machine_tags(context, name, key, value):
    machines = context.browser.find_elements_by_class_name('checkbox-link')
    tag_text = "%s=%s" % (key.lower(), value.lower())
    if context.mist_config.get(name):
        name = context.mist_config[name]
    for machine in machines:
        machine_name = machine.find_element_by_class_name('machine-name')
        if safe_get_element_text(machine_name).lower() == name.lower():
            tag = machine.find_element_by_css_selector('.pairs')
            if safe_get_element_text(tag).lower() == tag_text:
                return
            assert False, "Machine %s has no tag %s=%s" % (name, key, value)
    assert False, "Machine %s is not in the list" % name
