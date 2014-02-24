"""
@given:
-------

@when:
------
I visit mist.io     --> visit_home_page
I click the "{text}" button     --> general_click_button_by_text
I click the "text" button within "id" panel     --> click_button_in_panel

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

@when(u'i visit "{url}"')
def visit_custom_url(context, url):
    context.browser.visit(url)

@when(u'I click the "{text}" button')
def general_click_button_by_text(context, text):

    try:
        buttons = context.browser.find_by_css('button')
        buttons += context.browser.find_by_css('.ui-btn')
        buttons += context.browser.find_by_css('.ui-link')

        for button in buttons:
            if text in button.text.strip():
                try:
                    button.find_by_css('a').click()
                    sleep(time_fast)
                    return
                except:
                    button.find_by_css('input').click()
                    sleep(time_fast)
                    return
                else:
                    button.find_by_css('.ui-btn-text')[0].click()
                    sleep(time_fast)
                    return
    except:
        sleep(1)
        buttons = context.browser.find_by_css('button')
        buttons += context.browser.find_by_css('.ui-btn')
        buttons += context.browser.find_by_css('.ui-link')

        for button in buttons:
            if text in button.text.strip():
                try:
                    button.click()
                    sleep(time_fast)
                    return
                except:
                    button.find_by_css('a').click()
                    sleep(time_fast)
                    return
                else:
                    button.find_by_css('.ui-btn-text')[0].click()
                    sleep(time_fast)
                    return
    else:
        sleep(1)
        buttons = context.browser.find_by_css('button')
        buttons += context.browser.find_by_css('.ui-btn')
        buttons += context.browser.find_by_css('.ui-link')

        for button in buttons:
            if text in button.text.strip():
                try:
                    button.click()
                    sleep(time_fast)
                    return
                except:
                    button.find_by_css('input').click()
                    sleep(time_fast)
                    return
                else:
                    button.find_by_css('.ui-btn-text')[0].click()
                    sleep(time_fast)
                    return

    assert False, u'Could not find %s' % text

@when(u'I click the "{text}" button within "{id}" panel')
def click_button_in_panel(context, text, id):

    try:
        buttons = context.browser.find_by_css('#%s button' % id)
        buttons += context.browser.find_by_css('#%s .ui-btn' % id)
        buttons += context.browser.find_by_css('#%s .ui-link' % id)

        for button in buttons:
            if text in button.text.strip():
                try:
                    button.click()
                    sleep(time_fast)
                    return
                except:
                    button.find_by_css('input').click()
                    sleep(time_fast)
                    return
                else:
                    button.find_by_css('.ui-btn-text')[0].click()
                    sleep(time_fast)
                    return
    except:
        sleep(1)
        buttons = context.browser.find_by_css('button')
        buttons += context.browser.find_by_css('.ui-btn')
        buttons += context.browser.find_by_css('.ui-link')

        for button in buttons:
            if text in button.text.strip():
                try:
                    button.click()
                    sleep(time_fast)
                    return
                except:
                    button.find_by_css('input').click()
                    sleep(time_fast)
                    return
                else:
                    button.find_by_css('.ui-btn-text')[0].click()
                    sleep(time_fast)
                    return
    else:
        sleep(1)
        buttons = context.browser.find_by_css('button')
        buttons += context.browser.find_by_css('.ui-btn')
        buttons += context.browser.find_by_css('.ui-link')

        for button in buttons:
            if text in button.text.strip():
                try:
                    button.click()
                    sleep(time_fast)
                    return
                except:
                    button.find_by_css('input').click()
                    sleep(time_fast)
                    return
                else:
                    button.find_by_css('.ui-btn-text')[0].click()
                    sleep(time_fast)
                    return

    assert False, u'Could not find %s' % text
