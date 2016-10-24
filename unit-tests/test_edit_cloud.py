"""test for edit clodu credentials, edit title and creds.
   tested on packet, linode, ec2, gce"""
import random
import string
import pytest

from conftest import CREDS


def test_edit_cloud(cloud):
    pre_edit_cloud = cloud
    print "edit credentials"

    kwargs = CREDS[cloud.title]
    if not kwargs:
        return
    print 'for cloud %s, edit these creds %s' % (cloud.title, kwargs)
    cloud.ctl.update(**kwargs)

    assert cloud == pre_edit_cloud
    print 'edit cloud credentials succeeded for cloud %s' % cloud.title
