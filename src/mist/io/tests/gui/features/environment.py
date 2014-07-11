import random

from behaving import environment as benv

try:
    from mist.io.tests.settings import CREDENTIALS, LOCAL, DEBUG, BASE_DIR
except ImportError:
    pass

from mist.io.tests.helpers.docker_utils import docker_all_in_one
from mist.io.tests.helpers.selenium_utils import choose_driver


def before_all(context):
    benv.before_all(context)
    context.browser = choose_driver()
    if LOCAL:
        context.mist_url = "http://localhost:8000"
    else:
        docker_info = docker_all_in_one(flavor="io")
        context.remote_info = docker_info
        context.mist_url = docker_info['URL']

    context.credentials = CREDENTIALS
    context.machine_name = "TESTMACHINE" + str(random.randint(1, 10000))
    context.key_name = "TESTKEY" + str(random.randint(1, 10000))


def after_step(context, step):
    if step.status == 'failed':
        if DEBUG:
            import pdb
            pdb.set_trace()
        else:
            context.browser.get_screenshot_as_file(BASE_DIR + "/test.png")


def after_all(context):
    context.browser.quit()
    if not LOCAL:
        node = context.remote_info['node']
        container = context.remote_info['container']
        node.kill(container)
        node.remove_container(container)