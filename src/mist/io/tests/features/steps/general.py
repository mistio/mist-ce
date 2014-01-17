"""
@given:
-------

@when:
------
I visit mist.io     --> visit_home_page
I click the "{text}" button     -->

@then:
------
"""
from behave import *
from time import sleep

MIST_URL = 'http://127.0.0.1:6543/'
time_fast = 1
time_mid  = 3
time_slow = 5
time_vslow = 7

@when(u'i visit mist.io')
def visit_home_page(context):
    context.browser.visit(MIST_URL)


@when(u'I click the "{text}" button')
def general_click_button_by_text(context, text):
    #buttons
    buttons_count = len(context.browser.find_by_css('button'))
    for button_index in range(buttons_count):
        if text in context.browser.find_by_css('button')[button_index].text.strip():
            if context.browser.find_by_css('button')[button_index].text == text:
                context.browser.find_by_css('button')[button_index].click()
                sleep(time_fast)
                return

    # ui-btns
    buttons_count = len(context.browser.find_by_css('.ui-btn'))
    for button_index in range(buttons_count):
        if text in context.browser.find_by_css('.ui-btn')[button_index].text.strip():
            if context.browser.find_by_css('.ui-btn')[button_index].text == text:
                if context.browser.find_by_css('.ui-btn')[button_index].find_by_css('input'):
                    context.browser.find_by_css('.ui-btn')[button_index].find_by_css('input').click()
                else:
                    context.browser.find_by_css('.ui-btn')[button_index].click()
                    #context.browser.find_by_css('.ui-btn')[button_index].find_by_css('.ui-btn-text')[0].click()
                sleep(time_fast)
                return

    # links
    buttons_count = len(context.browser.find_by_css('.ui-link'))
    for button_index in range(buttons_count):
        if context.browser.find_by_css('.ui-link')[button_index].text == text:
            context.browser.find_by_css('.ui-link')[button_index].click()
            sleep(time_fast)
            return

    assert False, u'Could not find %s' % text
