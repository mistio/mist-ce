"""
@given:
-------

@when:
------
I star a "{name}" image     --> star_image

@then:
the first image should be "{name}"

------

"""


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


@then(u'the first image should be "{name}"')
def first_image(context, name):
    images = context.browser.find_by_css('.ui-listview li')

    if name in images[0].text:
        return
    else:
        assert False, u'The first image is not %s' % name