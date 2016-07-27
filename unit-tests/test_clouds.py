"""Tests Cloud models and Controllers"""

import os
import uuid

import yaml

import pytest

from mist.core.user.models import Organization

import mist.io.clouds.models as models


def load_clouds_from_config():
    """Load clouds configuration from unit-tests/clouds.yaml"""
    import os
    path = os.path.join(os.path.dirname(os.path.realpath(__file__)),
                        'clouds.yaml')
    clouds = []
    print "Loading clouds from %s." % path
    with open(path) as fobj:
        settings = yaml.load(fobj)
    for cdict in settings:
        if not isinstance(cdict, dict):
            raise Exception("Cloud configuration is not a dict: %r" % cdict)
        if 'model' not in cdict:
            raise Exception("Cloud configuration doesn't specify "
                            "cloud: %s" % cdict)
        model = cdict.pop('model')
        if not (model.endswith('Cloud') and hasattr(models, model)):
            raise Exception("Invalid cloud model: %s" % model)
        clouds.append(getattr(models, model)(**cdict))
    return clouds


def iter_clouds(test_func):
    """Iterate test function over CLOUDS"""
    return pytest.mark.parametrize(
        'cloud', load_clouds_from_config(),
        ids=lambda cloud: cloud.__class__.__name__
    )(test_func)


@iter_clouds
def test_list_machines(cloud):
    print len(cloud.ctl.list_machines())


@iter_clouds
def test_list_locations(cloud):
    print len(cloud.ctl.list_locations())


@iter_clouds
def test_list_images(cloud):
    print len(cloud.ctl.list_images())


@iter_clouds
def test_list_sizes(cloud):
    print len(cloud.ctl.list_sizes())
