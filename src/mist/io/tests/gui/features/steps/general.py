from behave import *
from time import time, sleep
from selenium.common.exceptions import NoSuchElementException, WebDriverException, StaleElementReferenceException
from selenium.webdriver import ActionChains

try:
    from mist.io.tests.settings import LOCAL
except ImportError:
    LOCAL = True
    pass


def i_am_in_homepage(context):
    possible_urls = [context.mist_config['MIST_URL']]
    if possible_urls[0].endswith('/'):
        hashtag = '#'
    else:
        hashtag = '/#'
    possible_urls.append(possible_urls[0] + hashtag)
    possible_urls.append(possible_urls[0] + hashtag + '/')
    return context.browser.current_url in possible_urls


@when(u'I visit mist.io')
def visit(context):
    """
    This method will visit the mist.io instance specified by MIST_URL in the
    settings file and if it lands on the sign in page then it will wait for
    the page to load, otherwise if it lands in the splash page then it will
    sleep for one second and then proceed. If you wish to wait for the splash
    page to load then you should use the "Then I wait for the mist.io splash
    page to load" rule.
    """
    context.browser.get(context.mist_config['MIST_URL'])
    end_time = time() + 4
    while time() < end_time:
        try:
            context.browser.find_element_by_id("splash")
            return
        except NoSuchElementException:
            sleep(1)

    assert False, "Splash page did not load after waiting for 4 seconds"


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


def wait_for_splash_to_appear(context, timeout=20):
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


@then(u'I wait for {seconds} seconds')
def wait(context, seconds):
    sleep(int(seconds))


@when(u'I wait for {seconds} seconds')
def wait(context, seconds):
    sleep(int(seconds))


@then(u'I click the button "{text}"')
def then_click(context, text):
    return click_button(context, text)


@when(u'I click the button "{text}"')
def click_button(context, text):
    """
    This function will try to click a button that says exactly the same thing as
    the text given. If it doesn't find any button like that then it will try
    to find a button that contains the text given.
    """
    buttons = context.browser.find_elements_by_class_name("ui-btn")
    click_button_from_collection(context, text, buttons,
                                 u'Could not find button that contains %s'
                                 % text)


@when(u'I click the "{text}" button inside the "{popup}" popup')
def click_button_within_popup(context, text, popup):
    popups = context.browser.find_elements_by_class_name("ui-popup-active")
    for pop in popups:
        if popup in pop.text:
            buttons = pop.find_elements_by_class_name("ui-btn")
            click_button_from_collection(context, text, buttons,
                                         u'Could not find %s button in %s popup'
                                         % (text, popup))


@when(u'I click the "{text}" button inside the "{panel_title}" panel')
def click_button_within_panel(context, text, panel_title):
    panels = context.browser.find_elements_by_class_name("ui-panel-open")
    if not panels:
        assert False, u'No open panels found. Maybe the driver got refocused ' \
                      u'or the panel failed to open'

    found_panel = None
    for panel in panels:
        header = panel.find_element_by_tag_name("h1")
        if panel_title in header.text:
            found_panel = panel
            break

    if not found_panel:
        assert False, u'Panel with Title %s could not be found. Maybe the ' \
                      u'driver got refocused or the panel failed to open or ' \
                      u'there is no panel with that title' % panel_title

    buttons = found_panel.find_elements_by_class_name("ui-btn")
    click_button_from_collection(context, text, buttons,
                                 u'Could not find %s button inside %s panel' %
                                 (text, panel_title))


def click_button_from_collection(context, text, button_collection, error_message):
    for button in button_collection:
        if text == button.text:
            for i in range(0, 2):
                try:
                    clicketi_click(context, button)
                    return
                except WebDriverException:
                    sleep(1)
            assert False, u'Could not click button that says %s' % button.text

    for button in button_collection:
        if text in button.text:
            for i in range(0, 2):
                try:
                    clicketi_click(context, button)
                    return
                except WebDriverException:
                    sleep(1)
            assert False, u'Could not click button that says %s' % button.text
    assert False, error_message


def clicketi_click(context, button):
    """
    trying two different ways of clicking a button because sometimes the
    Chrome driver for no apparent reason misinterprets the offset and
    size of the button
    """
    try:
        button.click()
    except WebDriverException:
        action_chain = ActionChains(context.browser)
        action_chain.move_to_element(button)
        action_chain.click()
        action_chain.perform()


@then(u'the title should be "{text}"')
def assert_title_is(context, text):
    assert text == context.browser.title


@then(u'the title should contain "{text}"')
def assert_title_contains(context, text):
    assert text in context.browser.title


@then(u'I wait for links in homepage to appear')
def wait_for_buttons_to_appear(context):
    end_time = time() + 100
    while time() < end_time:
        try:
            machines_button = None
            col = context.browser.find_elements_by_class_name('ui-btn')
            for button in col:
                if 'Machines' in button.text:
                    machines_button = button
                    break
            counter_span = machines_button.find_element_by_tag_name("span")
            counter = int(counter_span.text)
            break
        except (NoSuchElementException, StaleElementReferenceException,
                ValueError, AttributeError) as e:
            assert time() + 1 < end_time, "Links in the home page have not" \
                                          " appeared after 10 seconds"
            sleep(1)


@then(u'{counter_title} counter should be greater than {counter_number} within '
      u'{seconds} seconds')
def images_counter_loaded(context, counter_title, counter_number, seconds):
    elements = context.browser.find_elements_by_tag_name("li")
    counter_found = False
    for element in elements:
        if counter_title in element.text:
            counter_found = True
            break
    assert counter_found, "Counter with name %s has not been found" % counter_title

    end_time = time() + int(seconds)
    while time() < end_time:
        counter_span = element.find_element_by_tag_name("span")
        counter = int(counter_span.text)

        if counter > int(counter_number):
            return
        else:
            sleep(2)

    assert False, u'The counter did not say that more than %s images were ' \
                  u'loaded' % counter_number


@when(u'I visit the {title} page {timing} loading')
def go_to_some_page(context, title, timing):
    """
    WIll visit one of the basic pages(Machines, Images, Keys, Scripts) and has
    the choice of waiting for the counter to load or just go to the page
    regardless (before | after).
    For now the code will not be very accurate for keys page
    """
    if title not in ['Machines', 'Images', 'Keys', 'Networks', 'Scripts']:
        raise ValueError('The page given is unknown')
    if timing not in ['without', 'after']:
        raise ValueError('Timing provided is not recognized. It must be one of:'
                         ' without / after')
    if not i_am_in_homepage(context):
        if not str(context.browser.current_url).endswith(title.lower()):
            context.execute_steps(u'When I click the button "Home"')
    context.execute_steps(u'Then I wait for links in homepage to appear')
    if timing == 'after':
        context.execute_steps(u'Then %s counter should be greater than 0 '
                              u'within 80 seconds' % title)
    context.execute_steps(u'When I click the button "%s"' % title)
    if title == 'Machines':
        element_id = 'machine-list-page'
    elif title == 'Images':
        element_id = 'image-list-page'
    elif title == 'Keys':
        element_id = 'key-list-page'
    elif title == 'Scripts':
        element_id = 'script-list-page'
    elif title == 'Networks':
        element_id = 'network-list-page'
    end_time = time() + 5
    while time() < end_time:
        try:
            # context.browser.find_element_by_id('%s-list-page' % title.lower())
            context.browser.find_element_by_id(element_id)
            break
        except NoSuchElementException:
            assert time() + 1 < end_time, "%s list page has not appeared " \
                                          "after 5 seconds" % title.lower()
            sleep(1)
    if timing == 'after':
        if title == 'Machines':
            element_id = 'machines'
        elif title == 'Images':
            element_id = 'image-list'
        elif title == 'Keys':
            sleep(5)
            return
        elif title == 'Scripts':
            sleep(5)
            return
        elif title == 'Networks':
            element_id = 'networks'
        end_time = time() + 5
        while time() < end_time:

            try:
                # item_list = context.browser.find_element_by_id("%s-list" %
                #                                                title.lower())
                item_list = context.browser.find_element_by_id(element_id)
                items = item_list.find_element_by_tag_name('li')
                return
            except NoSuchElementException:
                sleep(1)

        assert False, "%s list has not loaded after 5 seconds" % title
