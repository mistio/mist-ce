from behave import *


@given(u'"{text}" cloud added through api')
def given_cloud(context, text):
    clouds = context.client.list_clouds()

    for cloud in clouds:
        if text in cloud['title']:
            return


@when(u'I list clouds')
def list_clouds(context):
    context.clouds = context.client.list_clouds()