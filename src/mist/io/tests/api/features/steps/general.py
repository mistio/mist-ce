from behave import *


@when(u'I list supported providers')
def list_providers(context):
    context.providers = context.client.supported_providers()

