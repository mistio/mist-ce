import mongoengine as me
from mist.core.cloud.models import Machine
from mist.io.exceptions import NotFoundError
from mist.io.schedules.base import BaseController

class ListOfMachinesController(BaseController):

    def _add__preparse_kwargs(self, auth_context, kwargs):

        machines_uuids = kwargs.get('machines_uuids', '')
        action = kwargs.get('action', '')
        # convert machines' uuids to machine objects
        # and check permissions
        if machines_uuids:
            machines_obj = []
            for machine_uuid in machines_uuids:
                try:
                    machine = Machine.objects.get(id=machine_uuid,
                                                  state__ne='terminated')
                except me.DoesNotExist:
                    raise NotFoundError('Machine state is terminated')

                cloud_id = machine.cloud.id
                # SEC require permission READ on cloud
                auth_context.check_perm("cloud", "read", cloud_id)

                if action:
                    # SEC require permission ACTION on machine
                    auth_context.check_perm("machine", action, machine_uuid)
                else:
                    # SEC require permission RUN_SCRIPT on machine
                    auth_context.check_perm("machine", "run_script",
                                            machine_uuid)

                machines_obj.append(machine)

        if machines_uuids:
            self.schedule.machines = machines_obj



class TaggedMachinesController(BaseController):

    def _add__preparse_kwargs(self, auth_context, kwargs):
        machines_tags = kwargs.get('machines_tags', '')
        action = kwargs.get('action', '')
        # check permissions for machines' tags
        if machines_tags:
            if action:
                # SEC require permission ACTION on machine
                auth_context.check_perm("machine", action, None)
            else:
                # SEC require permission RUN_SCRIPT on machine
                auth_context.check_perm("machine", "run_script", None)
