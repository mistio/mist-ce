"""test for edit clodu credentials, edit title and creds.
   tested on packet, linode, ec2, gce"""
import random
import string
import pytest

from conftest import CREDS as creds


def test_edit_cloud(cloud):
    pre_edit_cloud = cloud
    print "edit credentials"

    random_word = ''.join(random.choice(string.lowercase) for i in range(6))
    new_title = cloud.title + random_word
    kwargs = {'title': new_title}

    for k, v in creds.iteritems():
        if k == cloud.title:
            kwargs.update(v)
    print 'for cloud %s, edit these creds %s' % (cloud.title, kwargs)
    cloud.ctl.update_validate(**kwargs)

    assert cloud.title == new_title
    assert cloud == pre_edit_cloud
    print 'edit cloud credentials succeeded for cloud %s' % cloud.title
