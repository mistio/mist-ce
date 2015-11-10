import re
from time import time, sleep
from selenium.webdriver.remote.webelement import *
from mist.io.tests.gui.features.steps.general import *




@when(u'I check the machine for previous tags')
def delete_previous_tags(context):
    tags_holder = context.browser.find_element_by_id("machine-tags-popup")
    tags = tags_holder.find_elements_by_css_selector(".tag-item")
    for tag in tags:
        tag_input = tag.find_elements_by_css_selector("input")
        textfield_key = tag_input[0]
        textfield_value =tag_input[1]
        textfield_key_text = safe_get_element_text(textfield_key)
        textfield_value_text = safe_get_element_text(textfield_value)
        if textfield_key_text != " " and textfield_value_text != " ":
            textfield_value.clear()
            textfield_key.clear()
        else:
            pass


@when(u'I name a "{key}" key and a "{value}" value for a tag')
def fill_another_tag_name(context,key,value):

    tags_holder = context.browser.find_element_by_id("machine-tags-popup")
    tags = tags_holder.find_elements_by_css_selector(".tag-item")
    tag = tags[-1]

    tag_input = tag.find_elements_by_css_selector("input")
    textfield_key = tag_input[0]
    textfield_value =tag_input[1]
    textfield_key.send_keys(key)
    textfield_value.send_keys(value)


@then(u'I close one of my tags')
def close_a_tag(context):

   close_tag = context.browser.find_element_by_css_selector(".tag-item "
                                                            "a.ui-btn.icon-xx.ui-btn-icon-notext")
   close_tag.click()
   sleep(1)


@when(u'I check if the "{my_key}" key and "{my_value}" value appear for the machine')
def check_the_tags(context,my_key,my_value):

    check_tags = context.browser.find_elements_by_css_selector("#single-machine-info div.tag.pairs")
    words=[]
    for tag in check_tags:
        tag_text = safe_get_element_text(tag)
        tag_lst = tag_text.split("=")
        words.append(tag_lst)

    if [my_key,my_value] in words:
        pass
    else:
        assert False, u'tag is not pair of %s key and %s value' % (my_key, my_value)






