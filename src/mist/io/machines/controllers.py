class MachineController(object):
    def __init__(self, machine):
        self.machine = machine
    def reboot(self):
        return self.machine.cloud.ctl.reboot(self)
