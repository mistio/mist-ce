import logging
import mongoengine as me
from Crypto.PublicKey import RSA
from mist.io.exceptions import KeyExistsError
from mist.io.exceptions import KeyNotFoundError
from mist.io.exceptions import BadRequestError
from mist.io.exceptions import KeyValidationError
from mist.io.exceptions import KeyParameterMissingError

log = logging.getLogger(__name__)

class KeypairController(object):
    def __init__(self,  keypair):
        """Initialize a keypair controller given a keypair

        Most times one is expected to access a controller from inside the
        keypair, like this:

          keypair = mist.io.keypairs.models.Keypair.objects.get(id=keypair.id)
          keaypair.ctl.construct_public_from_private()
        """
        self.keypair = keypair

    def add(self, fail_on_invalid_params=True, **kwargs):

        # Check for invalid `kwargs` keys.
        errors = {}
        for key in kwargs.keys():
            if key not in self.keypair._fields.keys():
                error = "Invalid parameter %s=%r." % (key, kwargs[key])
                if fail_on_invalid_params:
                    errors[key] = error
                else:
                    log.warning(error)
                    kwargs.pop(key)
        if errors:
            log.error("Error updating %s: %s", self.keypair, errors)
            raise BadRequestError({
                'msg': "Invalid parameters %s." % errors.keys(),
                'errors': errors,
            })
        # FIXME is it necessary?
        # Set fields to cloud model and perform early validation.
        for key, value in kwargs.iteritems():
            setattr(self.keypair, key, value)
        try:
            self.keypair.validate(clean=True)
        except me.ValidationError as exc:
            log.error("Error updating %s: %s", self.keypair.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})

            # Attempt to save.
        try:
            self.keypair.save()
        except me.ValidationError as exc:
            log.error("Error updating %s: %s", self.keypair.name, exc.to_dict())
            raise BadRequestError({'msg': exc.message,
                                   'errors': exc.to_dict()})
        except me.NotUniqueError as exc:
            log.error("Cloud %s not unique error: %s", self.keypair.name, exc)
            raise KeyExistsError()

    def generate(self):
        """Generates a new RSA keypair and assignes to self."""
        from Crypto import Random
        Random.atfork()
        key = RSA.generate(2048)
        self.private = key.exportKey()
        self.public = key.exportKey('OpenSSH')

    def construct_public_from_private(self):
        """Constructs pub key from self.private and assignes to self.public.
        Only works for RSA.

        """
        from Crypto import Random
        Random.atfork()
        if 'RSA' in self.private:
            try:
                key = RSA.importKey(self.private)
                public = key.publickey().exportKey('OpenSSH')
                self.public = public
                return True
            except:
                pass
        return False

    def rename(self, name):  # replace io.methods.edit_key
        self.keypair.name = name
        self.keypair.save()


    # # FIXME
    # # check these functions, # replace io.methods. key related functions
    #
    # def set_default(self):
    #     key.objects(owner=owner).update(default=False)
    #
    # #kai gia machine
    # def assocciate(self):
    #
    # def disassociate(self):
    #
    # #TODO command()


