from behave import *
from time import time, sleep
from selenium.common.exceptions import NoSuchElementException, WebDriverException, StaleElementReferenceException
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.remote.webelement import *


try:
    from mist.io.tests.settings import LOCAL
except ImportError:
    LOCAL = True
    pass


def i_am_in_homepage(context):
    possible_urls = [context.mist_config['MIST_URL']]
    if not possible_urls[0].endswith('/'):
        temp = possible_urls[0]
        possible_urls[0] = temp + '/'
        possible_urls.append(temp)
    possible_urls.append(possible_urls[0] + '#')
    possible_urls.append(possible_urls[0] + '#' + '/')
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
    assert False, 'Page took longer than %s seconds to load' % str(timeout)


@then(u'I wait for {seconds} seconds')
def wait(context, seconds):
    sleep(int(seconds))


@when(u'I wait for {seconds} seconds')
def wait(context, seconds):
    sleep(int(seconds))


@then(u'I expect for "{panel_id}" panel to {action} within max {seconds} '
      u'seconds')
def panel_waiting_with_timeout(context, panel_id, action, seconds):
    """
    Function that waits for panel to appear but for a maximum amount of time
    """
    if action == 'appear':
        css_selector = '#%s:not([class*="ui-collapsible-collapsed"])' % panel_id
    elif action == 'disappear':
        css_selector = '#%s[class*="ui-collapsible-collapsed"]' % panel_id
    else:
        raise ValueError("Action can be either appear or disappear. Duh!")
    try:
        WebDriverWait(context.browser, int(seconds)).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, css_selector)))
    except TimeoutException:
        raise TimeoutException("Panel %s did not %s after %s seconds"
                               % (panel_id, action, seconds))


@then(u'I expect for "{popup_id}" popup to {action} within max {seconds} '
      u'seconds')
def popup_waiting_with_timeout(context, popup_id, action, seconds):
    """
    Function that wait for keyadd-popup to appear but for a maximum
    amount of time
    """
    if action == 'appear':
        css_selector = '#%s[class*="ui-popup-active"]' % popup_id
    elif action == 'disappear':
        css_selector = '#%s[class*="ui-popup-hidden"]' % popup_id
    else:
        raise ValueError("Action can be either appear or disappear. Duh!")
    try:
        WebDriverWait(context.browser, int(seconds)).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, css_selector)))
    except TimeoutException:
        raise TimeoutException("Popup %s did not %s after %s seconds"
                               % (popup_id, action, seconds))


@then(u'I expect for "{side_panel_id}" side panel to {action} within max '
      u'{seconds} seconds')
def popup_waiting_with_timeout(context, side_panel_id, action, seconds):
    """
    Function that wait for keyadd-popup to appear but for a maximum
    amount of time
    """
    if action == 'appear':
        css_selector = '#%s[class*="ui-panel-open"]' % side_panel_id
    elif action == 'disappear':
        css_selector = '#%s[class*="ui-panel-closed"]' % side_panel_id
    else:
        raise ValueError("Action can be either appear or disappear. Duh!")
    try:
        WebDriverWait(context.browser, int(seconds)).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, css_selector)))
    except TimeoutException:
        raise TimeoutException("Side panel %s did not %s after %s seconds"
                               % (side_panel_id, action, seconds))


@then(u'I expect for "{page_title}" page to appear within max {seconds} seconds')
def page_waiting_with_timeout(context, page_title, seconds):
    """
    Function that wait for page to appear but for a maximum amount of time
    """
    try:
        WebDriverWait(context.browser, int(seconds)).until(
            EC.presence_of_element_located((By.ID, page_title)))
    except TimeoutException:
        raise TimeoutException("Page %s did not appear after %s seconds"
                               % (page_title, seconds))

    
@then(u'I expect for "{loader_name}" loader to finish within max {seconds} '
      u'seconds')
def loader_name_waiting_with_timeout(context, loader_name, seconds):
    """
    Function that wait for loader_name to finish for a maximum amount of time.
    First it will wait for up to 2 seconds for loader to appear and then will
    wait for {seconds} seconds for the loader to disappear.
    If the loader name is key-generate-loader then as an extra precaution
    it will check if the loader has already finished by checking the parent
    container.
    """
    if loader_name == 'key-generate-loader':
        container = context.browser.find_element_by_id("key-add-private-container")
        if 'filled' in container.get_attribute('class'):
            return

    try:
        WebDriverWait(context.browser, 2).until(EC.presence_of_element_located((By.ID, loader_name)))
    except TimeoutException:
        raise TimeoutException("loader %s did not appear after 2 seconds"
                               % loader_name)

    end = time() + int(seconds)
    while time() < end:
        try:
            context.browser.find_element_by_id(loader_name)
            sleep(1)
        except NoSuchElementException:
            return
    assert False, 'Loader %s did not finish after %s seconds' % (loader_name,
                                                                  seconds)


@then(u'I expect for "{element_id}" to be visible within max {seconds} '
      u'seconds')
def become_visible_waiting_with_timeout(context, element_id, seconds):
    try:
        WebDriverWait(context.browser, int(seconds)).until(EC.visibility_of_element_located((By.ID, element_id)))
    except TimeoutException:
        raise TimeoutException("element with id %s did not become visible "
                               "after %s seconds" % (element_id, seconds))


@then(u'I expect for "{element_id}" to be clickable within max {seconds} '
      u'seconds')
def become_visible_waiting_with_timeout(context, element_id, seconds):
    try:
        WebDriverWait(context.browser, int(seconds)).until(EC.element_to_be_clickable((By.ID, element_id)))
    except TimeoutException:
        raise TimeoutException("element with id %s did not become visible "
                               "after %s seconds" % (element_id, seconds))


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
    click_button_from_collection(context, text,
                                 error_message='Could not find button that '
                                               'contains %s' % text)


@when(u'I click the "{text}" button inside the "{popup}" popup')
def click_button_within_popup(context, text, popup):
    popups = context.browser.find_elements_by_class_name("ui-popup-active")
    for pop in popups:
        if popup.lower() in pop.find_element_by_class_name('ui-title').text.lower():
            if text == '_x_':
                buttons = pop.find_elements_by_class_name("close")
                assert len(buttons) > 0, "Could not find the close button"
                for i in range(0, 2):
                    try:
                        clicketi_click(context, buttons[0])
                        return
                    except WebDriverException:
                        sleep(1)
                assert False, u'Could not click the close button'
            else:
                buttons = pop.find_elements_by_class_name("ui-btn")
                click_button_from_collection(context, text, buttons,
                                             'Could not find %s button in %s '
                                             'popup' % (text, popup))
                return
    assert False, "Could not find popup with title %s" % popup


@when(u'I click the "{text}" button inside the "{panel_title}" panel')
def click_button_within_panel(context, text, panel_title):
    panels = filter(lambda panel: 'ui-collapsible-collapsed' not in
                                  panel.get_attribute('class'),
                    context.browser.find_elements_by_class_name(
                        "ui-collapsible"))
    assert panels, u'No open panels found. Maybe the driver got refocused ' \
                   u'or the panel failed to open'

    found_panel = None
    for panel in panels:
        header = panel.find_element_by_class_name("ui-collapsible-heading")
        # header = header.find_element_by_class_name("title")
        if panel_title.lower() in header.text.lower():
            found_panel = panel
            break

    assert found_panel, 'Panel with Title %s could not be found. Maybe the ' \
                        'driver got refocused or the panel failed to open or '\
                        'there is no panel with that title' % panel_title

    buttons = found_panel.find_elements_by_class_name("ui-btn")
    click_button_from_collection(context, text, buttons,
                                 error_message='Could not find %s button'
                                               ' inside %s panel' %
                                               (text, panel_title))


def click_button_from_collection(context, text, button_collection=None,
                                 error_message="Could not find button"):
    button = search_for_button(context, text, button_collection)
    assert button, error_message
    for i in range(0, 2):
        try:
            clicketi_click(context, button)
            return
        except WebDriverException:
            sleep(1)
        assert False, u'Could not click button that says %s' % button.text


def search_for_button(context, text, button_collection=None, btn_cls='ui-btn'):
    if not button_collection:
        button_collection = context.browser.find_elements_by_class_name(btn_cls)
    # search for button with exactly the same text. sometimes the driver returns
    # the same element more than once and that's why we return the first
    # element of the list
    # also doing some cleaning if the text attribute also sends back texts
    # of sub elements
    button = filter(lambda b: b.text.rstrip().lstrip().split('\n')[0].lower() == text.lower()
                    and b.value_of_css_property('display') == 'block',
                    button_collection)
    if len(button) > 0:
        return button[0]

    # if we haven't found the exact text then we search for something that
    # looks like it
    for button in button_collection:
        button_text = button.text.split('\n')
        if len(filter(lambda b: text.lower() in b.lower(), button_text)) > 0:
            return button

    return None


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


@then(u'I wait for the links in homepage to appear')
def wait_for_buttons_to_appear(context):
    end_time = time() + 100
    while time() < end_time:
        try:
            images_button = search_for_button(context, 'Images')
            counter_span = images_button.find_element_by_class_name("ui-li-count")
            int(counter_span.text)
            break
        except (NoSuchElementException, StaleElementReferenceException,
                ValueError, AttributeError) as e:
            assert time() + 1 < end_time, "Links in the home page have not" \
                                          " appeared after 10 seconds"
            sleep(1)


@then(u'{counter_title} counter should be greater than {counter_number} within '
      u'{seconds} seconds')
def some_counter_loaded(context, counter_title, counter_number, seconds):
    counter_found = search_for_button(context, counter_title)
    assert counter_found, "Counter with name %s has not been found" % counter_title

    end_time = time() + int(seconds)
    while time() < end_time:
        counter_span = counter_found.find_element_by_class_name("ui-li-count")
        counter = int(counter_span.text)

        if counter > int(counter_number):
            return
        else:
            sleep(2)

    assert False, 'The counter did not say that more than %s images were ' \
                  'loaded' % counter_number


@when(u'I visit the {title} page after the counter has loaded')
def go_to_some_page_after_loading(context, title):
    """
    WIll visit one of the basic pages(Machines, Images, Keys, Scripts) and has
    the choice of waiting for the counter to load.
    For now the code will not be very accurate for keys page
    """
    go_to_some_page_after_counter_loading(context, title, title)


@when(u'I visit the {title} page after the {counter_title} counter has loaded')
def go_to_some_page_after_counter_loading(context, title, counter_title):
    """
    WIll visit one of the basic pages(Machines, Images, Keys, Scripts) and has
    the choice of waiting for some of the counters to load
    For now the code will not be very accurate for keys page
    """
    if title not in ['Machines', 'Images', 'Keys', 'Networks', 'Scripts']:
        raise ValueError('The page given is unknown')
    if counter_title not in ['Machines', 'Images', 'Keys', 'Networks', 'Scripts']:
        raise ValueError('The page given is unknown')
    context.execute_steps(u'Then I wait for the links in homepage to appear')
    context.execute_steps(u'Then %s counter should be greater than 0 '
                          u'within 80 seconds' % counter_title)

    go_to_some_page_without_waiting(context, title)

    end_time = time() + 5
    list_of_things = context.browser.find_element_by_id('%s-list' % title.lower().rpartition(title[-1])[0])
    while time() < end_time:
        try:
            items_loaded = list_of_things.find_elements_by_tag_name('li')
            if len(items_loaded) > 0:
                return
        except NoSuchElementException:
            pass
        assert time() + 1 < end_time, "No elements where loaded after 5" \
                                      " seconds"
        sleep(1)


@when(u'I visit the {title} page')
def go_to_some_page_without_waiting(context, title):
    """
    WIll visit one of the basic pages(Machines, Images, Keys, Scripts) without
    waiting for the counter or the list on the page to load.
    For now the code will not be very accurate for keys page
    """
    if title not in ['Machines', 'Images', 'Keys', 'Networks', 'Scripts',
                     'Account']:
        raise ValueError('The page given is unknown')
    if title == 'Account':
        context.browser.get(context.mist_config['MIST_URL'] + '/account')
        return
    if not i_am_in_homepage(context):
        if not str(context.browser.current_url).endswith(title.lower()):
            context.execute_steps(u'When I click the button "Home"')
    context.execute_steps(u'Then I wait for the links in homepage to appear')
    context.execute_steps(u'When I click the button "%s"' % title)

    end_time = time() + 5
    while time() < end_time:
        try:
            context.browser.find_element_by_id('%s-list-page' % title.lower().rpartition(title[-1])[0])
            break
        except NoSuchElementException:
            assert time() + 1 < end_time, "%s list page has not appeared " \
                                          "after 5 seconds" % title.lower()
            sleep(1)

    # this code will stop waiting after 3 seconds if nothing appears otherwise
    # it will stop as soon as a list is loaded
    end_time = time() + 3
    while time() < end_time:
        try:
            list_of_things = context.browser.find_element_by_id('%s-list' % title.lower().rpartition(title[-1])[0])
            lis = list_of_things.find_elements_by_tag_name('li')
            if len(lis) > 0:
                break
        except NoSuchElementException:
            pass
        sleep(1)
