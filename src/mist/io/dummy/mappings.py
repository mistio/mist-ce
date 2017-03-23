# This file holds dummy classes and methods to account for the absence of
# certain functionality in the open-source version of Mist.io, such as
# Role-based Access Control.
#
# All classes and methods, which are part of this module, are only meant to
# be used as placeholders.


class PermissionMapper(object):
    """This class provides a dummy interface to handle RBAC operations."""

    def __init__(self, org):
        self.org = org

    def update(self, *args, **kwargs):
        pass

    def remove(self, *args, **kwargs):
        pass

    def get_resources(self, *args, **kwargs):
        return {}


# Dummy RBAC Mapping, due to the absence of RBAC in open-source Mist.io.
RBACMapping = None
