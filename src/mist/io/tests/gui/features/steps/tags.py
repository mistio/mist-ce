import re
from mist.io.tests.gui.features.steps.general import *
from time import time, sleep
from selenium.webdriver.remote.webelement import *



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


