"""Machine entity model."""
import json
import uuid
import mongoengine as me

import mist.core.tag.models
from mist.io.clouds.models import Cloud
from mist.io.machines.controllers import MachineController

class Actions(me.EmbeddedDocument):
    start = me.BooleanField()
    stop = me.BooleanField()
    suspend = me.BooleanField()
    resume = me.BooleanField()
    reboot = me.BooleanField()
    destroy = me.BooleanField()
    resize = me.BooleanField()
    rename = me.BooleanField()
    tag = me.BooleanField()
    undefine = me.BooleanField()

class Cost(me.EmbeddedDocument):
    cost_per_hour = me.FloatField()
    cost_per_month = me.FloatField()

class Machine(me.Document):
    """The basic machine model"""
    # TODO where to move InstallationStatus
    from mist.core.cloud.models import KeyAssociation, InstallationStatus

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)

    cloud = me.ReferenceField(Cloud, required=True)
    name = me.StringField()

    # Info gathered mostly by libcloud (or in some cases user input).
    # Be more specific about what this is. We should perhaps come up with a better name.
    machine_id = me.StringField(required=True, unique_with="cloud")
    hostname = me.StringField()  # Rename to host or hostname
    public_ips = me.ListField()
    private_ips = me.ListField()
    ssh_port = me.IntField(default=22)
    os_type = me.StringField(default='unix', choices=('unix', 'windows'))  # CHOICES
    rdp_port = me.IntField(default=3389)  # Rename to rdp_port

    actions = me.EmbeddedDocumentField(Actions)
    # Add extra missing fields.
    extra = me.DictField()
    cost = me.EmbeddedDocumentField(Cost)
    image_id = me.StringField()
    size = me.StringField()
    state = me.StringField()  # TODO choices
    # TODO better DictField and in as_dict() make it list for js
    tags = me.ListField()


    # We should think this through a bit.
    key_associations = me.EmbeddedDocumentListField(KeyAssociation)

    last_seen = me.DateTimeField()
    missing_since = me.DateTimeField()
    created = me.DateTimeField()  # Change to datetime field

    # Most of these will change with the new UI.
    # All monitoring info should probably be inside an embedded document.
    hasMonitoring = me.BooleanField()  # This shouldn't be camelcase
    monitor_server = me.StringField()
    collectd_password = me.StringField()
    metrics = me.ListField()  # list of metric_id's
    installation_status = me.EmbeddedDocumentField(InstallationStatus)

    meta = {
        'collection': 'machines',
    }

    def __init__(self, *args, **kwargs):
        super(Machine, self).__init__(*args, **kwargs)
        self.ctl = MachineController(self)

    # Should this be a field? Should it be a @property? Or should it not exist?
    @property
    def owner(self):
        return self.cloud.owner

    def delete(self):
        super(Machine, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):
        # Return a dict as it will be returned to the API
        # TODO tags as a list return for the ui
        view = json.loads(self.to_json())
        view['last_seen'] = str(self.last_seen or '')
        view['missing_since'] = str(self.missing_since or '')
        view['created'] = str(self.created or '')
        return view

    def as_dict_old(self):
        # Return a dict as it was previously being returned by list_machines
        mdict = {
            'id': self.id,
            'dns_name': self.hostname,
            'public_ips': self.public_ips,
            'private_ips': self.private_ips,
            'name': self.name,
            'ssh_port': self.ssh_port,
            'os_type': self.os_type,
            'remote_desktop_port': self.rdp_port,
            'machine_id': self.machine_id,
            'hasMonitoring': self.hasMonitoring,
            'monitor_server': self.monitor_server,
            'collectd_password': self.collectd_password,
            'metrics': self.metrics,
            'installation_status': self.installation_status,
            'ket_associations': self.key_associations,
            'cloud': self.cloud,
            'last_seen': str(self.last_seen or ''),
            'missing_since': str(self.missing_since or ''),
            'created': str(self.created or '')
        }

        return mdict

    def __str__(self):
        return 'Machine %s (%s) in %s' % (self.name, self.id, self.cloud)
