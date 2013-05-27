import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid',
    'apache-libcloud',
    'PasteScript',
    'fabric',
    'paramiko',
    'pyyaml',
    'pycrypto',
    'requests',
]

setup(name='mist.io',
      version='0.9.2',
      license = 'AGPLv3',
      description='cloud management, monitoring & automation from any web device',
      long_description=README + '\n\n' +  CHANGES,
      classifiers=[
        "Programming Language :: Python",
        "Framework :: Pylons",
        "Topic :: Internet :: WWW/HTTP",
        "License :: OSI Approved :: GNU Affero General Public License v3",
        "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
        ],
      author='unweb.me',
      author_email='we@unweb.me',
      url='https://mist.io',
      keywords='web cloud mobile libcloud pyramid amazon rackspace openstack linode',
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

