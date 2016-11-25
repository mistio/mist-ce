"""Script entity model."""
import mongoengine as me

from uuid import uuid4

from mist.core import config
import mist.core.tag.models
from mist.core.user.models import Owner


class Script(me.Document):
    """The basic Script Model."""
    id = me.StringField(primary_key=True,
                        default=lambda: uuid4().hex)

    name = me.StringField(required=True)
    description = me.StringField()

    # exec_type must be in ('executable', 'ansible', 'collectd_python_plugin')
    exec_type = me.StringField(required=True,
                               choices=['executable', 'ansible',
                                        'collectd_python_plugin'])
    # location_type must be in ('url', 'github', 'inline')
    location_type = me.StringField(required=True,
                                   choices=['url', 'github', 'inline'])
    # script is (url, repo, source code, depending on location_type)
    script = me.StringField(required=True)
    # used for url (if archive) and repos
    entrypoint = me.StringField()
    # extra params, currently used only for collectd_python_plugin
    extra = me.DictField()

    deleted = me.BooleanField(default=False)

    owner = me.ReferenceField(Owner, required=True)

    # def get_jobs(self):
    #     """Get jobs related to script."""
    #     conn = MongoClient(config.MONGO_URI)
    #     db = conn['mist']
    #     cursor = db.ansible_jobs.find({'script_id': self.id})
    #     # FIXME

    def delete(self):
        super(Script, self).delete()
        mist.core.tag.models.Tag.objects(resource=self).delete()

    def as_dict(self):  # ToDO to_json
        """Data representation for api calls."""
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "exec_type": self.exec_type,
            "location_type": self.location_type,
            "entrypoint": self.entrypoint,
            "extra": self.extra,
            "script": self.script
        }

    def __str__(self):
        return 'Script %s (%s) of %s' % (self.name, self.id, self.owner)
