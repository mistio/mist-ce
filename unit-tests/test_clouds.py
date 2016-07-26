"""Tests Cloud models and Controllers"""

import uuid

import pytest

from mist.core.user.models import Organization

import mist.io.clouds.models as models

SETTINGS = [
]


ORG = Organization(name=uuid.uuid4().hex)


CLOUDS = [cdict.pop('model')(owner=ORG, **cdict) for cdict in SETTINGS]


@pytest.mark.parametrize('cloud', CLOUDS)
def test_list_machines(cloud):
    print len(cloud.ctl.list_machines())


@pytest.mark.parametrize('cloud', CLOUDS)
def test_list_locations(cloud):
    print len(cloud.ctl.list_locations())


@pytest.mark.parametrize('cloud', CLOUDS)
def test_list_images(cloud):
    print len(cloud.ctl.list_images())


@pytest.mark.parametrize('cloud', CLOUDS)
def test_list_sizes(cloud):
    print len(cloud.ctl.list_sizes())
