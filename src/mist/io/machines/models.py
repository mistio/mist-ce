import uuid
import mongoengine as me

from mist.io.clouds.models import Cloud


class Actions(me.EmbeddedDocument):
    start = BooleanField()
    stop = BooleanField()


class Machine(me.Document):
    """The basic machine model"""

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)

    cloud = me.ReferenceField(Cloud, required=True)
    name = me.StringField()

    # Info gathered mostly by libcloud (or in some cases user input).
    # Be more specific about what this is. We should perhaps come up with a better name.
    machine_id = me.StringField(required=True, unique_with="cloud")
    dns_name = me.StringField()  # Rename to host or hostname
    public_ips = me.ListField()
    private_ips = me.ListField()
    ssh_port = me.IntField(default=22)
    os_type = me.StringField(default='unix')  # CHOICES
    remote_desktop_port = me.IntField(default=3389)  # Rename to rdp_port

    actions = EmbeddedDocument(Actions)
    # Add extra missing fields.

    # We should think this through a bit.
    key_associations = me.EmbeddedDocumentListField(KeyAssociation)

    last_seen = me.DateTimeField()
    missing_since = me.DateTimeField()
    created = me.FloatField()  # Change to datetime field

    # Most of these will change with the new UI.
    # All monitoring info should probably be inside an embedded document.
    hasMonitoring = me.BooleanField()  # This shouldn't be camelcase
    monitor_server = me.StringField()
    collectd_password = me.StringField()
    metrics = me.ListField()  # list of metric_id's
    installation_status = me.EmbeddedDocumentField(InstallationStatus)

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
        return json.loads(self.to_json())

    def as_dict_old(self):
        # Return a dict as it was previously being returned by list_machines

    def __str__(self):
        return 'Machine %s (%s) in %s' % (self.name, self.id, self.cloud)
