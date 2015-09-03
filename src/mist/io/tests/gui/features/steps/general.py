from behave import *
from time import time, sleep
from selenium.common.exceptions import NoSuchElementException

try:
    from mist.io.tests.settings import LOCAL
except ImportError:
    LOCAL = True
    pass


@when(u'I visit mist.io')
def visit(context):
    """
    This method will visit the mist.io instance specified by MIST_URL in the
    settings file and if it lands on the sign in page then it will wait for
    the page to load, otherwise if it lands in the splash page then it will
    sleep for one second and then proceed. If you wish to wait for the splash
    page to load then you should use the "Then I wait for the mist.io splash
    page to load" rule.
    :param context:
    :return:
    """
    context.browser.get(context.mist_config['MIST_URL'])
    try:
        sleep(1)
        context.browser.find_element_by_id("splash")
        sleep(1)
        return
    except NoSuchElementException:
        pass
    timeout = 120 if LOCAL else 160
    end_time = time() + timeout
    while time() < end_time:
        try:
            login_page = context.browser.find_element_by_id("signup-popup")
            display = login_page.value_of_css_property("display")
            width = login_page.value_of_css_property("width")

            if 'block' in display:
                if width == '1px':
                    return
                else:
                    raise NoSuchElementException

            if not display or 'none' in display:
                return

        except NoSuchElementException as e:
            sleep(5)

    assert False, u'Page took longer than %s seconds to load' % str(timeout)


@then(u'I wait for the mist.io splash page to load')
def standard_splash_waiting(context):
    """
    Function that waits for the splash to load. The maximum time for the page
    to load is 60 seconds in this case
    """
    wait_for_splash_to_appear(context)
    wait_for_splash_to_load(context)


@then(u'I wait for the mist.io splash page to load for max {seconds} seconds')
def splash_waiting_with_timeout(context, seconds):
    """
    Function that waits for the splash page to load but fora maximum amount
    of seconds. The amount of time given must be enough for the splash page
    to appear first and then also load.
    """
    wait_for_splash_to_appear(context, 10)
    wait_for_splash_to_load(context, timeout=(int(seconds)-10))


def wait_for_splash_to_appear(context, timeout=10):
    end = time() + timeout
    while time() < end:
        try:
            context.browser.find_element_by_id("splash")
            return
        except NoSuchElementException:
            sleep(1)
    assert False, u'Splash did not appear after %s seconds' % str(timeout)


def wait_for_splash_to_load(context, timeout=60):
    end = time() + timeout
    while time() < end:
        splash_page = context.browser.find_element_by_id("splash")
        display = splash_page.value_of_css_property("display")

        if 'none' in display:
            return
    assert False, u'Page took longer than %s seconds to load' % str(timeout)


@when(u'I wait for {seconds} seconds')
def wait(context, seconds):
    sleep(int(seconds))


@when(u'I click the "{text}" button')
def click_button(context, text):
    try:
        buttons = context.browser.find_elements_by_class_name("ui-btn")
        for button in buttons:
            if button.text == text:
                button.click()
                return
    except:
        sleep(1)
        buttons = context.browser.find_elements_by_class_name("ui-btn")
        for button in buttons:
            if button.text == text:
                button.click()
                return

    assert False, u'Could not find %s button' % text


@when(u'I click the button that contains "{text}"')
def click_button(context, text):
    buttons = context.browser.find_elements_by_class_name("ui-btn")
    for button in buttons:
        if text in button.text:
            button.click()
            return

    assert False, u'Could not find button that contains %s' % text


@when(u'I click the "{text}" button inside the "{popup}" popup')
def click_button_within_popup(context, text, popup):
    popups = context.browser.find_elements_by_class_name("ui-popup-active")
    for pop in popups:
        if popup in pop.text:
            buttons = pop.find_elements_by_class_name("ui-btn")
            for button in buttons:
                if text in button.text:
                    button.click()
                    return

    assert False, u'Could not find %s button in %s popup' % (text, popup)


@when(u'I click the "{text}" button inside the "{panel_title}" panel')
def click_button_within_panel(context, text, panel_title):
    panels = context.browser.find_elements_by_class_name("ui-panel-open")
    if not panels:
        assert False, u'No open panels found. Maybe the driver got refocused or the panel failed to open'

    found_panel = None
    for panel in panels:
        header = panel.find_element_by_tag_name("h1")
        if panel_title in header.text:
            found_panel = panel
            break

    if not found_panel:
        assert False, u'Panel with Title %s could not be found. Maybe the driver got refocused or the panel ' \
                      u'failed to open or there is no panel with that title' % panel_title

    buttons = found_panel.find_elements_by_class_name("ui-btn")
    for button in buttons:
        if text in button.text:
            button.click()
            return

    assert False, u'Could not find %s button inside %s panel' % (text, panel_title)


@then(u'the title should be "{text}"')
def assert_title_is(context, text):
    assert text == context.browser.title


@then(u'the title should contain "{text}"')
def assert_title_contains(context, text):
    assert text in context.browser.title

