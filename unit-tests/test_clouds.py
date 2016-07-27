"""Tests Cloud models and Controllers"""

import uuid

import pytest

from mist.core.user.models import Organization

import mist.io.clouds.models as models

SETTINGS = [
]


ORG = Organization(name=uuid.uuid4().hex)


CLOUDS = [cdict.pop('model')(owner=ORG, **cdict) for cdict in SETTINGS]


def iter_clouds(test_func):
    """Iterate test function over CLOUDS"""
    return pytest.mark.parametrize(
        'cloud', CLOUDS, ids=lambda cloud: cloud.__class__.__name__
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
