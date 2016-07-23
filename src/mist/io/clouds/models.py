"""Cloud entity model."""
import json

import mongoengine as me

from uuid import uuid4

import mist.core.tag.models
from mist.core.config import MONGO_URI
from mist.core.user.models import Owner
from mist.core.keypair.models import Keypair


class HtmlSafeStrField(me.StringField):
    """Escapes < and > when reading field."""

    def to_mongo(self, value):
        if value is None:
            return value
        value = value.replace("&", "&amp;")
        value = value.replace("<", "&lt;")
        value = value.replace(">", "&gt;")
        return value


class InstallationStatus(me.EmbeddedDocument):
    # automatic: refers to automatic installations from mist.core
    # manual: refers to manual deployments and everything from
    #         standalone mist.io

    # automatic:
    # - preparing: Set on first API call before everything else
    # - pending: Enabled on mist.monitor, submitted celery task
    # - installing: Celery task running
    # - failed: Ansible job failed (also set finished_at)
    # - succeeded: Ansible job succeeded (also set finished_at)
    # manual:
    # - preparing: Same as for automatic
    # - installing: Enabled on mist.monitor, returned command for manual install
    # - succeeded: Set when activated_at is set (see below)
    state = me.StringField()

    manual = me.BooleanField()  # True only for mist.core automatic installations

    activated_at = me.IntField()  # Data for period after started_at recieved

    started_at = me.IntField()  # timestamp: First enable_monitoring API call

    # following apply only for automatic:
    finished_at = me.IntField()  # Ansible job completed (also set state)
    stdout = me.StringField()  # Ansible job captured stdout/stderr mux streams
    error_msg = me.StringField()

    def as_dict(self):
        return json.loads(self.to_json())


class Cloud(me.Document):
    """The basic Cloud Model.A cloud vm provider cloud"""
    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)
    title = me.StringField(required=True)  #, unique_with="owner")
    owner = me.ReferenceField(Owner, required=True)

    enabled = me.BooleanField(default=True)
    machine_count = me.IntField(default=0)
    apiurl = me.StringField()
    apikey = HtmlSafeStrField()
    apisecret = me.StringField()
    tenant_name = HtmlSafeStrField()
    auth_version = HtmlSafeStrField()
    region = HtmlSafeStrField()
    poll_interval = me.IntField(default=10000)
    provider = HtmlSafeStrField()
    compute_endpoint = me.StringField()
    key_file = me.StringField()
    cert_file = me.StringField()
    ca_cert_file = me.StringField()
    ssh_port = me.IntField(default=22)
    docker_port = me.IntField(default=4243)
    starred = me.ListField()
    unstarred = me.ListField()
    images_location = me.StringField()

    def delete(self):
        super(Cloud, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):
        return json.loads(self.to_json())

    def __str__(self):
        return '%s cloud %s (%s) of %s' % (self.provider, self.title,
                                           self.id, self.owner)


class KeyAssociation(me.EmbeddedDocument):
    keypair = me.ReferenceField(Keypair)
    last_used = me.IntField(default=0)
    ssh_user = me.StringField()
    sudo = me.BooleanField()
    port = me.IntField(default=22)


class Machine(me.Document):
    """The basic Machine Model.
    A saved machine in the machines list of some cloud.
    For the time being, only bare metal machines are saved, for API clouds
    we get the machine list from the provider.
    """

    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)
    dns_name = me.StringField()
    public_ips = me.ListField()
    private_ips = me.ListField()
    name = me.StringField()
    ssh_port = me.IntField(default=22)
    os_type = me.StringField(default='unix')
    remote_desktop_port = me.IntField(default=3389)
    machine_id = me.StringField(required=True, unique_with="cloud")
    hasMonitoring = me.BooleanField()

    monitor_server = me.StringField()
    collectd_password = me.StringField()
    metrics = me.ListField()  # list of metric_id's
    installation_status = me.EmbeddedDocumentField(InstallationStatus)
    key_associations = me.EmbeddedDocumentListField(KeyAssociation)
    cloud = me.ReferenceField(Cloud, required=True)

    last_seen = me.DateTimeField()
    missing_since = me.DateTimeField()
    created = me.FloatField()

    @property
    def owner(self):
        return self.cloud.owner

    def delete(self):
        super(Machine, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):
        return json.loads(self.to_json())

    def __str__(self):
        return 'Machine %s (%s) in %s' % (self.name, self.id, self.cloud)


class ShellCapture(me.Document):
    owner = me.ReferenceField(Owner, required=True)
    capture_id = me.StringField()
    cloud_id = me.StringField()
    machine_id = me.StringField()
    key_id = me.StringField()
    host = me.StringField()
    ssh_user = me.StringField()
    started_at = me.FloatField()
    finished_at = me.FloatField()
    columns = me.IntField()
    rows = me.IntField()


class CloudImage(me.Document):
    """A base Cloud Image Model."""
    image_id = me.StringField(required=True, unique_with=("cloud_provider", "cloud_region"))
    cloud_provider = me.StringField(required=True)
    cloud_region = me.StringField() # eg for RackSpace
    name = me.StringField()
    os_type = me.StringField(default='linux')
    deprecated = me.BooleanField(default=False)

    meta = {
        'indexes': [
            'cloud_provider', 'image_id'
        ],
    }

    def __str__(self):
        name = "%s, %s (%s)" % (self.name, self.cloud_provider, self.image_id )
        return name

    def clean(self):
        # os_type is needed for the pricing per VM
        if self.name and self.cloud_provider.startswith('ec2'):
            if 'suse linux enterprise' in self.name.lower() or 'sles' in self.name.lower():
                self.os_type = 'sles'
            if 'red hat' in self.name.lower() or 'rhel' in self.name.lower():
                self.os_type = 'rhel'
            if 'windows' in self.name.lower():
                self.os_type = 'mswin'
                if 'sql' in self.name.lower():
                    self.os_type = 'mswinSQL'
                    if 'web' in self.name.lower():
                        self.os_type = 'mswinSQLWeb'
            if 'vyatta' in self.name.lower():
                self.os_type = 'vyatta'
        if self.name and self.cloud_provider.startswith('rackspace'):
            if 'red hat' in self.name.lower():
                self.os_type = 'redhat'
            if 'windows server' in self.name.lower():
                self.os_type = 'windows'
                if 'sql' in self.name.lower():
                    self.os_type = 'mssql-standard'
                    if 'web' in self.name.lower():
                        self.os_type = 'mssql-web'
            if 'vyatta' in self.name.lower():
                self.os_type = 'vyatta'

        super(CloudImage, self).clean()


class CloudSize(me.Document):
    """A base Cloud Size Model."""
    size_id = me.StringField(required=True, unique_with=("cloud_provider", "cloud_region"))
    cloud_provider = me.StringField(required=True)
    cloud_region = me.StringField() # eg for RackSpace
    name = me.StringField()
    price = me.StringField()
    deprecated = me.BooleanField(default=False)

    meta = {
        'indexes': [
            'cloud_provider'
        ],
    }

    def __str__(self):
        name = "%s, %s (%s)" % (self.name, self.size_id, self.cloud_provider)
        return name
