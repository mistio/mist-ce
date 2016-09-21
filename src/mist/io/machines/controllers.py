class MachineController(object):
    def __init__(self, machine):
        """Initialize machine controller given a machine

        Most times one is expected to access a controller from inside the
        machine, like this:

            machine = mist.io.machines.models.Machine.objects.get(id=machine_id)
            machine.cloud.ctl.reboot()
        """

        self.machine = machine

    def start(self):
        return self.machine.cloud.ctl.start_machine(self.machine)

    def stop(self):
        return self.machine.cloud.ctl.stop_machine(self.machine)

    def suspend(self):
        """Suspends machine - used in KVM libvirt to pause machine"""
        return self.machine.cloud.ctl.suspend_machine(self.machine)

    def resume(self):
        """Resumes machine - used in KVM libvirt to resume suspended machine"""
        return self.machine.cloud.ctl.resume_machine(self.machine)

    def reboot(self):
        return self.machine.cloud.ctl.reboot_machine(self.machine)

    def destroy(self):
        return self.machine.cloud.ctl.destroy_machine(self.machine)

    def resize(self):
        """Resize a machine on an other plan."""
        return self.machine.cloud.ctl.resize_machine(self.machine,
                                                     self.machine.cloud.
                                                     owner.plan_id)

    def rename(self, name=None):
        """Renames a machine on a certain cloud."""
        return self.machine.cloud.ctl.rename_machine(self.machine, name)

    # TODO we want this also ?
    # def tag(self):
    #     return self.machine.cloud.ctl.tag(self.machine)
    #
    def undefine(self):
        """Undefines machine - used in KVM libvirt
        to destroy machine and delete XML conf"""
        return self.machine.cloud.ctl.undefine_machine(self.machine)
