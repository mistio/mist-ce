import sys
import json
import random

from mist.io.tests import config

from mist.io.tests.helpers.selenium_utils import choose_driver
from selenium.webdriver.remote.errorhandler import NoSuchWindowException


def before_all(context):

    context.mist_config = dict()
    context.mist_config['browser'] = choose_driver()
    context.browser = context.mist_config['browser']
    context.mist_config['ERROR_NUM'] = 0
    context.mist_config['MIST_URL'] = config.MIST_URL
    context.mist_config['CREDENTIALS'] = config.CREDENTIALS
    context.mist_config['NON_STOP'] = '--stop' not in sys.argv
    context.mist_config['JS_CONSOLE_LOG'] = config.JS_CONSOLE_LOG
    context.mist_config['BROWSER_FLAVOR'] = config.BROWSER_FLAVOR
    context.mist_config['SCREENSHOT_PATH'] = config.SCREENSHOT_PATH
    context.mist_config['KEY_NAME'] = "TESTKEY" + str(random.randint(1, 10000))
    context.mist_config['MACHINE_NAME'] = "TESTMACHINE" + str(random.randint(1, 10000))


def after_scenario(context, scenario):
    if scenario.status == 'failed':
        if context.mist_config['NON_STOP']:
            num = context.mist_config['ERROR_NUM'] = context.mist_config['ERROR_NUM'] + 1
            try:
                context.browser.get_screenshot_as_file(context.mist_config['SCREENSHOT_PATH'] + '.{0}.png'.format(str(num)))
            except NoSuchWindowException:
                pass
        else:
            try:
                context.browser.get_screenshot_as_file(context.mist_config['SCREENSHOT_PATH'] + '.png')
            except NoSuchWindowException:
                pass


def after_all(context):
    if context.mist_config['BROWSER_FLAVOR'] == 'chrome':
        js_console_logs = context.mist_config['browser'].get_log('browser')
        formatted_js_console_logs = json.dumps(js_console_logs, indent=5)
        fp = open(context.mist_config['JS_CONSOLE_LOG'], 'w')
        fp.write(formatted_js_console_logs)
        fp.close()
    context.mist_config['browser'].quit()
    if context.mist_config.get('browser2'):
        context.mist_config['browser2'].quit()
