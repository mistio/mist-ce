import os
import random
from shutil import copyfile
import pickle

from behaving import environment as benv
from behaving.web.steps import *
from behaving.personas.steps import *

from splinter import Browser


def before_all(context):
    benv.before_all(context)

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

    pickle_file = "src/mist/io/tests/features/persona.pickle"
    PERSONAS = pickle.load(open(pickle_file, "rb"))

    context.personas = PERSONAS

    try:
        os.remove("db.yaml")
    except:
        pass


def before_scenario(context, scenario):
    benv.before_scenario(context, scenario)

    pickle_file = "src/mist/io/tests/features/persona.pickle"
    PERSONAS = pickle.load(open(pickle_file, "rb"))
    context.personas = PERSONAS


def after_scenario(context, scenario):
    benv.after_scenario(context, scenario)
