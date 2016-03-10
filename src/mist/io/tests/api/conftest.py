import pytest

from time import time
from datetime import date, timedelta

from mist.io.tests import config
from mist.io.tests.api.io import MistIoApi


@pytest.fixture
def pretty_print(request):
    print "\n============================================================"
    print " ".join([word.capitalize() for word in request.function.__name__.split('_')])

    def fin():
        print "\n============================================================"

    request.addfinalizer(fin)
    return 'bla'


@pytest.fixture
def email():
    return config.EMAIL


@pytest.fixture
def password1():
    return config.PASSWORD1


@pytest.fixture
def password2():
    return config.PASSWORD2


@pytest.fixture
def mist_io():
    return MistIoApi(config.MIST_URL)


@pytest.fixture
def expires():
    return (date.fromtimestamp(time()) + timedelta(days=1, hours=1)).strftime("%Y-%m-%d %H:%M:%S")


@pytest.fixture
def expired():
    return (date.fromtimestamp(time()) + timedelta(days=-1, hours=1)).strftime("%Y-%m-%d %H:%M:%S")
