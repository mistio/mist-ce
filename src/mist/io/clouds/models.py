"""Definition of Cloud models"""

import mongoengine as me

from mist.core.keypair.models import Keypair

from mist.io.clouds.base import Cloud
import mist.io.clouds.controllers as controllers


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
