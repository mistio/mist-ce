"""Machine entity model."""
import json
import uuid
import mongoengine as me

from mist.core import config as core_config
import mist.core.tag.models
from mist.io.clouds.models import Cloud
from mist.io.keys.models import Key
from mist.io.machines.controllers import MachineController


class KeyAssociation(me.EmbeddedDocument):
    keypair = me.ReferenceField(Key)
    last_used = me.IntField(default=0)
    ssh_user = me.StringField()
    sudo = me.BooleanField()
    port = me.IntField(default=22)


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
    # - installing: Enabled on mist.monitor,
    #               returned command for manual install
    # - succeeded: Set when activated_at is set (see below)
    state = me.StringField()
    # True only for mist.core automatic installations
    manual = me.BooleanField()

    activated_at = me.IntField()  # Data for period after started_at received

    started_at = me.IntField()  # timestamp: First enable_monitoring API call

    # following apply only for automatic:
    finished_at = me.IntField()  # Ansible job completed (also set state)
    stdout = me.StringField()  # Ansible job captured stdout/stderr mux streams
    error_msg = me.StringField()

    def as_dict(self):
        return json.loads(self.to_json())


class Actions(me.EmbeddedDocument):
    start = me.BooleanField(default=False)
    stop = me.BooleanField(default=False)
    reboot = me.BooleanField(default=False)
    destroy = me.BooleanField(default=False)
    resize = me.BooleanField(default=False)
    rename = me.BooleanField(default=False)
    tag = me.BooleanField(default=False)
    resume = me.BooleanField(default=False)
    suspend = me.BooleanField(default=False)
    undefine = me.BooleanField(default=False)


class Monitoring(me.EmbeddedDocument):
    # Most of these will change with the new UI.
    hasmonitoring = me.BooleanField()
    monitor_server = me.StringField()  # Deprecated
    collectd_password = me.StringField()
    metrics = me.ListField()  # list of metric_id's
    installation_status = me.EmbeddedDocumentField(InstallationStatus)

    def get_commands(self):
        # FIXME: This is a hack.
        from mist.io.methods import get_deploy_collectd_command_unix
        from mist.io.methods import get_deploy_collectd_command_windows
        from mist.io.methods import get_deploy_collectd_command_coreos
        args = (self._instance.id, self.collectd_password,
                core_config.COLLECTD_HOST, core_config.COLLECTD_PORT)
        return {
            'unix': get_deploy_collectd_command_unix(*args),
            'coreos': get_deploy_collectd_command_coreos(*args),
            'windows': get_deploy_collectd_command_windows(*args),
        }

    def as_dict(self):
        status = self.installation_status

        return {
            'hasmonitoring': self.hasmonitoring,
            'monitor_server': core_config.COLLECTD_HOST,
            'collectd_password': self.collectd_password,
            'metrics': self.metrics,
            'installation_status': status.as_dict() if status else '',
            'commands': self.get_commands(),
        }


class Cost(me.EmbeddedDocument):
    hourly = me.FloatField(default=0)
    monthly = me.FloatField(default=0)

    def as_dict(self):
        return json.loads(self.to_json())


class Machine(me.Document):
    """The basic machine model"""

    id = me.StringField(primary_key=True, default=lambda: uuid.uuid4().hex)

    cloud = me.ReferenceField(Cloud, required=True)
    name = me.StringField()

    # Info gathered mostly by libcloud (or in some cases user input).
    # Be more specific about what this is.
    # We should perhaps come up with a better name.
    machine_id = me.StringField(required=True)
    hostname = me.StringField()
    public_ips = me.ListField()
    private_ips = me.ListField()
    ssh_port = me.IntField(default=22)
    os_type = me.StringField(default='unix', choices=('unix', 'linux',
                                                      'windows', 'coreos'))
    rdp_port = me.IntField(default=3389)
    actions = me.EmbeddedDocumentField(Actions, default=lambda: Actions())
    extra = me.DictField()
    cost = me.EmbeddedDocumentField(Cost, default=lambda: Cost())
    image_id = me.StringField()
    size = me.StringField()
    # libcloud.compute.types.NodeState
    state = me.StringField(choices=('running', 'starting', 'rebooting',
                                    'terminated', 'pending', 'unknown',
                                    'stopping', 'stopped', 'suspended',
                                    'error', 'paused', 'reconfiguring')
                           )

    # We should think this through a bit.
    key_associations = me.EmbeddedDocumentListField(KeyAssociation)

    last_seen = me.DateTimeField()
    missing_since = me.DateTimeField()
    created = me.DateTimeField()

    monitoring = me.EmbeddedDocumentField(Monitoring,
                                          default=lambda: Monitoring())

    meta = {
        'collection': 'machines',
        'indexes': [
            {
                'fields': ['cloud', 'machine_id'],
                'sparse': False,
                'unique': True,
                'cls': False,
            },
        ],
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

        # tags as a list return for the ui
        tags = {tag.key: tag.value for tag in mist.core.tag.models.Tag.objects(
             owner=self.cloud.owner, resource=self
        ).only('key', 'value')}
        # Optimize tags data structure for js...
        if isinstance(tags, dict):
            tags = [{'key': key, 'value': value}
                    for key, value in tags.iteritems()]
        return {
            'id': self.id,
            'hostname': self.hostname,
            'public_ips': self.public_ips,
            'private_ips': self.private_ips,
            'name': self.name,
            'ssh_port': self.ssh_port,
            'os_type': self.os_type,
            'rdp_port': self.rdp_port,
            'machine_id': self.machine_id,
            'actions': {'%s:%s' % (action, self.actions[action])
                        for action in self.actions},
            'extra': self.extra,
            'cost': self.cost.as_dict(),
            'image_id': self.image_id,
            'size': self.size,
            'state': self.state,
            'tags': tags,
            'monitoring': self.monitoring.as_dict() if self.monitoring else '',
            'key_associations': self.key_associations,
            'cloud': self.cloud.id,
            'last_seen': str(self.last_seen or ''),
            'missing_since': str(self.missing_since or ''),
            'created': str(self.created or '')
        }

    def as_dict_old(self):
        # Return a dict as it was previously being returned by list_machines

        # This is need to be consistent with the previous situation
        self.extra.update({'created': str(self.created or ''),
                           'cost_per_month': '%.2f' % (self.cost.monthly),
                           'cost_per_hour': '%.2f' % (self.cost.hourly)})
        # tags as a list return for the ui
        tags = {tag.key: tag.value for tag in mist.core.tag.models.Tag.objects(
            owner=self.cloud.owner, resource=self).only('key', 'value')}
        # Optimize tags data structure for js...
        if isinstance(tags, dict):
            tags = [{'key': key, 'value': value}
                    for key, value in tags.iteritems()]
        return {
            'id': self.machine_id,
            'uuid': self.id,
            'name': self.name,
            'public_ips': self.public_ips,
            'private_ips': self.private_ips,
            'imageId': self.image_id,
            'last_seen': str(self.last_seen or ''),
            'missing_since': str(self.missing_since or ''),
            'state': self.state,
            'size': self.size,
            'extra': self.extra,
            'tags': tags,
            'can_stop': self.actions.stop,
            'can_start': self.actions.start,
            'can_destroy': self.actions.destroy,
            'can_reboot': self.actions.reboot,
            'can_tag': self.actions.tag,
            'can_undefine': self.actions.undefine,
            'can_rename': self.actions.rename,
            'can_suspend': self.actions.suspend,
            'can_resume': self.actions.resume
        }

    def __str__(self):
        return 'Machine %s (%s) in %s' % (self.name, self.id, self.cloud)
