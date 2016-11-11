import logging
import mongoengine as me
from Crypto.PublicKey import RSA
from mist.io.exceptions import KeyExistsError
from mist.io.exceptions import BadRequestError
from mist.io.clouds.utils import rename_kwargs
from mist.io.helpers import trigger_session_update
from mist.io.exceptions import MachineUnauthorizedError

log = logging.getLogger(__name__)


class BaseMachineCredsController(object):  # TODO BaseController
    def __init__(self,  basemachinecreds):
        """Initialize a keypair controller given a keypair

        Most times one is expected to access a controller from inside the
        keypair, like this:

          keypair = mist.io.keypairs.models.Keypair.objects.get(id=keypair.id)
          keypair.ctl.construct_public_from_private()
        """
        self.basemachinecreds = basemachinecreds

    def add(self, fail_on_invalid_params=True, **kwargs):
        raise NotImplemented