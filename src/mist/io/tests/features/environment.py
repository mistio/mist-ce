import os
import random
from shutil import copyfile

from behaving import environment as benv
from behaving.web.steps import *
from behaving.personas.steps import *

from splinter import Browser

#We want everything to be auto-configured so that we do not have to
#issue a lot of commands in out testing facilities. If test_config.py
#does not exist paster will fail cause it will try to find it. We could
#solve this by __name__ == '__main__', but this way we'll be sure we always
#have a copy



def before_all(context):
    benv.before_all(context)

    files_dir = "src/mist/io/tests/features/"
    files = os.listdir(files_dir)
    if not "test_config.py" in files:
        copyfile(files_dir+"test_config.py.dist", files_dir+"test_config.py")


    from test_config import CREDENTIALS, MISTCREDS, TESTNAMES

    PERSONAS = {
        'NinjaTester': dict(
            creds=CREDENTIALS,
            mistcreds=MISTCREDS,
            machine=TESTNAMES['machine_name']+str(random.randint(1, 10000)),
            image_machine=TESTNAMES['image_machine']+str(random.randint(1, 10000)),
            key_name=TESTNAMES['key']+str(random.randint(1, 10000))
        )
    }

    context.personas = PERSONAS
    #context.browser = Browser('phantomjs')
    try:
        copyfile("db.yaml", "db.yaml.test_backup")
        os.remove("db.yaml")
    except:
        pass


def after_all(context):
    try:
        copyfile("db.yaml.test_backup", "db.yaml")
        os.remove("db.yaml.test_backup")
    except:
        pass


def before_feature(context, feature):
    benv.before_feature(context, feature)


def before_scenario(context, scenario):
    benv.before_scenario(context, scenario)
    from test_config import CREDENTIALS, MISTCREDS, TESTNAMES


    PERSONAS = {
        'NinjaTester': dict(
            creds=CREDENTIALS,
            mistcreds=MISTCREDS,
            machine=TESTNAMES['machine_name']+str(random.randint(1, 10000)),
            image_machine=TESTNAMES['image_machine']+str(random.randint(1, 10000)),
            key_name=TESTNAMES['key']+str(random.randint(1, 10000))
        )
    }
    context.personas = PERSONAS


def after_scenario(context, scenario):
    benv.after_scenario(context, scenario)
