"""test for update cloud credentials.
   tested on packet, linode, ec2, gce"""
import random
import string
import pytest

from conftest import CREDS

from mist.io.exceptions import BadRequestError
from mist.io.exceptions import CloudUnauthorizedError
from mist.io.exceptions import CloudUnavailableError


def test_update_cloud(cloud):
    pre_updated_cloud = cloud
    print "update credentials"

    # choose the creds of relevant cloud provider
    kwargs = CREDS[cloud.title]
    if not kwargs:
        print 'no creds provided'
        return
    print '* for cloud %s, update these creds %s' % (cloud.title, kwargs.keys())
    cloud.ctl.update(**kwargs)

    assert cloud == pre_updated_cloud
    print '- edit cloud credentials succeeded for cloud %s' % cloud.title

    valid_kwargs = kwargs

    kwargs = dict((k+'a', v) for k, v in valid_kwargs.items())
    print '* test invalid creds keys %s ' % kwargs.keys()
    print '- expected to raise BadRequestError'
    with pytest.raises(BadRequestError):
        cloud.ctl.update(fail_on_error=True,
                         fail_on_invalid_params=True,**kwargs)

    print '* test invalid credentials values'
    kwargs = dict((k,'aa'+v) for k,v in valid_kwargs.items())

    if cloud.title == 'packet':
        print '- expected to raise CloudUnauthorized'
        with pytest.raises(CloudUnauthorizedError):
            cloud.ctl.update(fail_on_error=True,
                             fail_on_invalid_params=True, **kwargs)

    # # FIXME this don't catch the exception!
    # if cloud.title in ['ec2', 'gce', 'linode']:
    #     print '- expected to raise CloudUnavailable'
    #     with pytest.raises((CloudUnauthorizedError, CloudUnavailableError,
    #                         Exception)):
    #         cloud.ctl.update(fail_on_error=True,
    #                          fail_on_invalid_params=True,**kwargs)


def test_rename_cloud(cloud):
    print 'rename cloud with title %s' % cloud.title

    random_word = ''.join(random.choice(string.lowercase) for i in range(6))
    new_title = str(cloud.title) + '_' + random_word
    print 'new title is %s' % new_title

    cloud.ctl.rename(new_title)
    assert new_title == cloud.title
    print 'rename cloud succeeded'





