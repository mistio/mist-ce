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
    starred_images = context.browser.find_elements_by_class_name("ui-checkbox-on")
    if len(starred_images) > 0:
        return
    else:
        assert False, u'No starred images found'


@then(u'an Image that contains "{text}" should be starred')
def assert_starred_image(context, text):
    images_list = context.browser.find_element_by_id("image-list")
    images = images_list.find_elements_by_tag_name("li")

    starred_images = []
    for image in images:
        try:
            image.find_element_by_class_name("ui-checkbox-on")
            starred_images.append(image)
        except:
            pass

    for image in starred_images:
        if text in image.text:
            return

    assert False, u'No starred image found containing: %s ' % text


@when(u'I search for a "{text}" Image')
def search_image(context, text):
    search_bar = context.browser.find_elements_by_class_name("image-search")
    assert len(search_bar) > 0, "Could not find the image search input"
    assert len(search_bar) == 1, "Found more than one image search input " \
                                 "elements"
    search_bar = search_bar[0]
    for letter in text:
        search_bar.send_keys(letter)
    sleep(2)


@when(u'I star an Image that contains "{text}"')
def star_image(context, text):
    images_list = context.browser.find_element_by_id("image-list")
    images = images_list.find_elements_by_tag_name("li")

    for image in images:
        if text in image.text:
            star_button = image.find_element_by_class_name("ui-checkbox")
            star_button.click()
            return


@when(u'I clear the Images search bar')
def clear_image_search_bar(context):
    search_bar = context.browser.find_element_by_id("search-term-input")
    for i in range(20):
        search_bar.send_keys(u'\ue003')