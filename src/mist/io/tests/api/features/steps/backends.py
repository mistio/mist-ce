from behave import *


@given(u'"{text}" backend added through api')
def given_backend(context, text):
    backends = context.client.list_backends()

    for backend in backends:
        if text in backend['title']:
            return


@when(u'I list backends')
def list_backends(context):
    context.backends = context.client.list_backends()