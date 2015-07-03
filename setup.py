import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'python-memcached',
    'pyramid',
    'apache-libcloud',
    'PasteScript',
    'paramiko',
    'pyyaml',
    'pycrypto',
    'requests',
    'nose',
    'behaving',
    'sphinxcontrib-httpdomain',
    'sphinx-bootstrap-theme',
    'celery',
    'gevent',
    'gevent-subprocess',
    'amqp',
    'netaddr',
    'amqp',
    'websocket-client',
    'sockjs-tornado',
    'pika',
]

setup(name='mist.io',
      version='0.9.8',
      license = 'AGPLv3',
      description='server management, monitoring & automation across clouds from any web device',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "License :: OSI Approved :: GNU Affero General Public License v3",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='mist.io',
      author_email='info@mist.io',
      url='https://mist.io',
      keywords='web cloud server management monitoring automation mobile libcloud pyramid amazon aws rackspace openstack linode softlayer digitalocean gce',
      packages=find_packages('src'),
      package_dir = {'':'src'},
      namespace_packages=['mist'],
      include_package_data=True,
      zip_safe=False,
      install_requires=requires,
      tests_require=requires,
      test_suite="mist.io",
      entry_points = """\
      [paste.app_factory]
      main = mist.io:main
      """,
      )
