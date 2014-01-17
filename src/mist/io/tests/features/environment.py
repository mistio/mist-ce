import os
import random
from shutil import copyfile

from behaving import environment as benv
from behaving.web.steps import *
from behaving.personas.steps import *

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


def before_all(context):
    benv.before_all(context)
    context.personas = PERSONAS
    try:
        copyfile("db.yaml", "db.yaml.test_backup")
        os.remove("db.yaml")
        print "Removing file"
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
    context.personas = PERSONAS

def after_scenario(context, scenario):
    benv.after_scenario(context, scenario)