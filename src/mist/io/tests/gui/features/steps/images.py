from behave import *
from time import time, sleep
from mist.io.tests.gui.features.steps.general import *


@then(u'Images list should be loaded within {seconds} seconds')
def images_loaded(context, seconds):
    end_time = time() + int(seconds)
    while time() < end_time:
        images = context.browser.find_elements_by_class_name("checkbox-link")
        if len(images) > 0:
            return
        sleep(2)

    assert False, u'Images not loaded within %s seconds' % seconds


@then(u'there should be starred Images')
def starred_images_loaded(context):
    starred_images = context.browser.find_elements_by_class_name("staron")
    assert len(starred_images) > 0, u'No starred images found'


@then(u'an Image that contains "{text}" should be starred')
def assert_starred_image(context, text):
    images_list = context.browser.find_element_by_id("image-list")
    images = images_list.find_elements_by_tag_name("li")
    starred_images = filter(lambda li: 'staron' in li.get_attribute('class'), images)
    if text == 'the_name_that_i_used_before':
        text = context.mist_config['PREVIOUS_IMAGE_NAME']
    starred_image = filter(lambda li: text in safe_get_element_text(li).lower(), starred_images)
    assert len(starred_image) == 1, "Could not find starred image with name %s" % text


@when(u'I star an Image that contains "{text}"')
def star_image(context, text):
    images_list = context.browser.find_element_by_id("image-list")
    images = images_list.find_elements_by_tag_name("li")

    for image in images:
        if text in safe_get_element_text(image):
            star_button = image.find_element_by_class_name("ui-checkbox")
            star_button.click()
            image = image.find_element_by_tag_name('h3')
            context.mist_config['PREVIOUS_IMAGE_NAME'] = safe_get_element_text(image)
            return


@when(u'I clear the Images search bar')
def clear_image_search_bar(context):
    search_bar = context.browser.find_element_by_id("search-term-input")
    for i in range(20):
        search_bar.send_keys(u'\ue003')


@then(u'I unstar the image that contains "{text}"')
def unstar_image(context, text):
    images_list = context.browser.find_element_by_id("image-list")
    images = images_list.find_elements_by_tag_name("li")
    if text == 'the_name_that_i_used_before':
        text = context.mist_config['PREVIOUS_IMAGE_NAME']
    for image in images:
        if text in safe_get_element_text(image):
            star_button = image.find_element_by_class_name("ui-checkbox")
            star_button.click()
            return


@then(u'there should be {num} unstarred images')
def unstar_image(context, num):
    images_list = context.browser.find_element_by_id("image-list")
    unstarred_images = images_list.find_element_by_class_name('staroff')
    assert len(unstarred_images) == int(num), "There are %s and not %s " \
                                              "unstarred images" % \
                                              (len(unstarred_images), int(num))


def scroll_down_and_wait(context, wait_for_unstarred_images=False, wait=5):
    """
    Wait for a few seconds until new images are loaded
    :return: True if new images have been loaded, False otherwise
    """
    previous_scroll_height = context.browser.find_elements_by_class_name('checkbox-link')[-1].location['y']
    context.browser.execute_script("window.scrollTo(0, %s)"
                                   % previous_scroll_height)
    end_time = time() + wait
    while time() < end_time:
        sleep(1)
        last_image = context.browser.find_elements_by_class_name('checkbox-link')[-1]
        scroll_height = last_image.location['y']
        if previous_scroll_height != scroll_height:
            if not wait_for_unstarred_images and 'staroff' in last_image.get_attribute('class'):
                return False
            return True

    return False


@step(u'I scroll down until all starred images appear')
def get_all_starred_images(context):
    while scroll_down_and_wait(context):
        pass


@step(u'I scroll down until all images appear')
def get_all_images(context):
    while scroll_down_and_wait(context, wait_for_unstarred_images=True):
        pass


@then(u'I click the image "{image_name}" of provider "{provider}"')
def click_an_image(context, image_name, provider):
    if context.mist_config.get(image_name):
        image_name = context.mist_config[image_name]
    if context.mist_config.get(provider):
        provider = context.mist_config[provider]

    images = context.browser.find_elements_by_class_name('checkbox-link')
    filtered_images = filter(
            lambda image: safe_get_element_text(image.find_element_by_class_name('tag')).lower() == provider.lower(), images)
    filtered_images = filter(
            lambda image: safe_get_element_text(image.find_element_by_tag_name('h3')).lower() == image_name.lower(), filtered_images)
    if len(filtered_images) == 0:
        assert False, "No image with name %s from provider %s exists" % (image_name, provider)
    elif len(filtered_images) > 1:
        assert False, "Multiple images with name %s and provider %s exist" % (image_name, provider)
    position = filtered_images[0].location
    context.browser.execute_script("window.scrollTo(0, %s)" % position['y'])
    filtered_images[0].click()
