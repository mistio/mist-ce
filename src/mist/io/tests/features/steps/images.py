"""
@given:
-------

@when:
------
I star a "{name}" image     --> star_image
I type "{name}" in images search box        --> advance_search

@then:
the first/second image should be "{name}"      --> first_image
I should see "{name}" images within {timeout} seconds       --> parse_advance_search

------

"""
from time import sleep, time

from general import time_vslow, time_fast, time_mid, time_slow

@when(u'I star a "{name}" image')
def star_image(context, name):
    global selected_image_name

    images = context.browser.find_by_css('.ui-listview li')
    for image in images:
        if name in image.text:
            selected_image_name = image.text.strip()
            break

    try:
        image.find_by_css('.ui-btn')[0].click()
    except:
        assert False, u'Could not star or could not find an image containing %s' % name


@then(u'the first/second image should be "{name}"')
def first_image(context, name):
    images = context.browser.find_by_css('.ui-listview li')

    if name in images[0].text or name in images[1].text:
        return
    else:
        assert False, u'The first image is not %s' % name


@when(u'I type "{name}" in images search box')
def advance_search(context, name):
    context.browser.find_by_css('.ui-input-search input').fill(name)
    # images = context.browser.find_by_css('.ui-listview li')
    # results = []
    #
    # for image in images:
    #     if not image.find_by_css('.ui-screen-hidden'):
    #         results.append(image)
    #
    # for image in results:
    #     if name in image.text:


@then(u'I should see "{name}" images within {timeout} seconds')
def parse_advance_search(context, name, timeout):
        end_time = time() + int(timeout)
        while time() < end_time:
            images = context.browser.find_by_css('.ui-listview li')
            for image in images:
                if name in image.text:
                    return
            sleep(2)

        assert False, u'Could not find any results in %s seconds' % timeout