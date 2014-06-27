from behave import *
from random import randrange


@when(u'I fill in a random machine name')
def fill_machine_mame(context):
    textfield = context.browser.find_element_by_id("create-machine-name")
    random_machine_name = "TESTLIKEAPRO" + str(randrange(10000))
    for letter in random_machine_name:
        textfield.send_keys(letter)
    context.random_machine_name = random_machine_name