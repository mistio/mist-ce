"""Definition of Cloud models"""

import json

from uuid import uuid4

import mongoengine as me

from mist.core.user.models import Organization
from mist.core.keypair.models import Keypair
from mist.core.tag.models import Tag

import mist.io.clouds.controllers as controllers


class Cloud(me.Document):
    """Base class for every cloud/provider"""

    id = me.StringField(primary_key=True, default=lambda: uuid4().hex)
    owner = me.ReferenceField(Organization, required=True)

    title = me.StringField(required=True, unique_with="owner")
    enabled = me.BooleanField(default=True)

    machine_count = me.IntField(default=0)

    starred = me.ListField()
    unstarred = me.ListField()

    meta = {'allow_inheritance': True}
    # FIXME: use a different collection name to avoid conflicts when migrating
    # previous models.
    # TODO: Add index on owner

    _controller_cls = None

    def __init__(self, *args, **kwargs):
        super(Cloud, self).__init__(*args, **kwargs)
        if self._controller_cls is None:
            raise NotImplementedError()
        self.ctl = self._controller_cls(self)

    def delete(self):
        super(Cloud, self).delete()
        Tag.objects(resource=self).delete()

    def as_dict(self):
        return json.loads(self.to_json())

    def __str__(self):
        return '%s cloud %s (%s) of %s' % (type(self), self.title,
                                           self.id, self.owner)


class AmazonCloud(Cloud):

    apikey = me.StringField(required=True)
    api_secret = me.StringField(required=True)
    region = me.StringField(required=True)

    _controller_cls = controllers.AmazonController


class DigitalOceanCloud(Cloud):

    token = me.StringField(required=True)

    _controller_cls = controllers.DigitalOceanController



class DigitalOceanFirstGenCloud(Cloud):

    apikey = me.StringField(required=True)
    apisecret = me.StringField(required=True)

    _controller_cls = controllers.DigitalOceanFirstGenController


class LinodeCloud(Cloud):

    apikey = me.StringField(required=True)

    _controller_cls = controllers.LinodeController


class RackSpaceCloud(Cloud):

    username = me.StringField(required=True)
    apikey = me.StringField(required=True)
    region = me.StringField(required=True)

    _controller_cls = controllers.RackSpaceController


class SoftLayerCloud(Cloud):

    username = me.StringField(required=True)
    apikey = me.StringField(required=True)

    _controller_cls = controllers.SoftLayerController


class NephoScaleCloud(Cloud):

    username = me.StringField(required=True)
    password = me.StringField(required=True)

    _controller_cls = controllers.NephoScaleController


class AzureCloud(Cloud):

    subscription_id = me.StringField(required=True)
    certificate = me.StringField(required=True)

    _controller_cls = controllers.AzureController


class GoogleCloud(Cloud):

    email = me.StringField(required=True)
    private_key = me.StringField(required=True)
    project_id = me.StringField(required=True)

    _controller_cls = controllers.GoogleController


class HostVirtualCloud(Cloud):

    apikey = me.StringField(required=True)

    _controller_cls = controllers.HostVirtualController


class PacketCloud(Cloud):

    apikey = me.StringField(required=True)
    project_id = me.StringField(required=False)

    _controller_cls = controllers.PacketController


class VultrCloud(Cloud):

    apikey = me.StringField(required=True)

    _controller_cls = controllers.VultrController


class VSphereCloud(Cloud):

    host = me.StringField(required=True)
    username = me.StringField(required=True)
    password = me.StringField(required=True)

    _controller_cls = controllers.VSphereController


class VCloud(Cloud):

    host = me.StringField(required=True)
    username = me.StringField(required=True)
    password = me.StringField(required=True)

    _controller_cls = controllers.VCloudController


class OpenStackCloud(Cloud):

    username = me.StringField(required=True)
    password = me.StringField(required=True)
    url = me.StringField(required=True)
    tenant = me.StringField(required=True)
    region = me.StringField(required=False)
    compute_endpoint = me.StringField(required=False)

    _controller_cls = controllers.OpenStackController


class DockerCloud(Cloud):

    host = me.StringField(required=True)
    port = me.IntField(required=True, default=4243)

    # User/Password Authentication (optional)
    username = me.StringField(required=False)
    password = me.StringField(required=False)

    # TLS Authentication (optional)
    key_file = me.StringField(required=False)
    cert_file = me.StringField(required=False)
    ca_cert_file = me.StringField(required=False)

    _controller_cls = controllers.DockerController


class LibvirtCloud(Cloud):

    host = me.StringField(required=True)
    username = me.StringField(default='root')
    port = me.IntField(required=True, default=22)
    key = me.ReferenceField(Keypair, required=False)
    images_location = me.StringField(default="/var/lib/libvirt/images")

    _controller_cls = controllers.LibvirtController


# FIXME
class CoreOSCloud(Cloud):

    _controller_cls = controllers.CoreOSController


# FIXME
class OtherCloud(Cloud):

    _controller_cls = controllers.OtherController
