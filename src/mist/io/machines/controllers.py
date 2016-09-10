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
        return self.machine.cloud.ctl.start(self.machine)

    def stop(self):
        return self.machine.cloud.ctl.stop(self.machine)

    def suspend(self):
        return self.machine.cloud.ctl.suspend(self.suspend)

    def resume(self):
        return self.machine.cloud.ctl.resume(self.machine)

    def reboot(self):
        return self.machine.cloud.ctl.reboot(self.machine)

    def destroy(self):
        return self.machine.cloud.ctl.destroy(self.machine)

    # todo resize

    def rename(self, name):
        return self.machine.cloud.ctl.rename(self.machine, name)
    #
    # def tag(self):
    #     return self.machine.cloud.ctl.tag(self.machine)
    #
    def undefine(self):
        return self.machine.cloud.ctl.undefine(self.machine)
