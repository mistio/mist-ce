import random

try:
    from mist.io.tests.settings import CREDENTIALS, LOCAL, DEBUG, BASE_DIR, \
                                       MIST_URL, MAIL_PATH
except ImportError:
    pass

from mist.io.tests.helpers.docker_utils import docker_all_in_one
from mist.io.tests.helpers.selenium_utils import choose_driver


def before_all(context):
    context.browser = choose_driver()

    context.mist_config = dict()
    context.mist_config['MACHINE_NAME'] = "TESTMACHINE" + str(random.randint(1, 10000))
    context.mist_config['KEY_NAME'] = "TESTKEY" + str(random.randint(1, 10000))
    context.mist_config['CREDENTIALS'] = CREDENTIALS

    # if not LOCAL:
    #     docker_info = docker_all_in_one(flavor="io")
    #     context.remote_info = docker_info

    context.mist_config['MIST_URL'] = MIST_URL
    # if LOCAL else docker_info['URL']


def after_step(context, step):
    if step.status == 'failed':
        if DEBUG:
            import pdb
            pdb.set_trace()
        else:
            context.browser.get_screenshot_as_file(BASE_DIR + "/test.png")


def after_all(context):
    context.browser.quit()
    # if not LOCAL:
    #     node = context.remote_info['node']
    #     container = context.remote_info['container']
    #     node.kill(container)
    #     node.remove_container(container)
