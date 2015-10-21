from behave import *
from time import time, sleep


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
    starred_image = filter(lambda li: text in li.text.lower(), starred_images)
    assert len(starred_image) == 1, "Could not find starred image with name %s" % text


@when(u'I star an Image that contains "{text}"')
def star_image(context, text):
    images_list = context.browser.find_element_by_id("image-list")
    images = images_list.find_elements_by_tag_name("li")

    for image in images:
        if text in image.text:
            star_button = image.find_element_by_class_name("ui-checkbox")
            star_button.click()
            context.mist_config['PREVIOUS_IMAGE_NAME'] = image.find_element_by_tag_name('h3').text
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
        if text in image.text:
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

