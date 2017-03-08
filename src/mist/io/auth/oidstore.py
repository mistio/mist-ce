import time
import mongoengine as me

from openid.store import nonce
from openid.association import Association
from openid.store.interface import OpenIDStore


class MistAssociation(me.Document):

    server_url = me.StringField()

    handle = me.StringField()

    secret = me.StringField()

    issued = me.IntField()

    lifetime = me.IntField(min_value=0, default=6 * 6 * 60)

    assoc_type = me.StringField()

    meta = {'allow_inheritance': False}

    def is_expired(self):
        return self.lifetime + self.issued < time.time()


class MistNonce(me.Document):

    server_url = me.StringField()

    timestamp = me.IntField()

    salt = me.StringField()

    def is_old(self, lifespan=None):
        return is_nonce_old(self.timestamp, lifespan)


def is_nonce_old(timestamp, lifespan=None):
    if not lifespan:
        lifespan = nonce.SKEW
    return abs(time.time() - timestamp) > lifespan


class OpenIdMistStore(OpenIDStore):

    def storeAssociation(self, server_url, association):
        """
        This method will store a MistAssociation object into mongodb after
        creating a MistAssociation with the same values as the Association
        provided.
        Secret will be encoded because it constantly produced errors with
        encoding.
        """

        mist_association = MistAssociation()
        mist_association.assoc_type = association.assoc_type
        mist_association.handle = association.handle.encode('hex')
        mist_association.secret = association.secret.encode('hex')
        mist_association.lifetime = association.lifetime
        mist_association.issued = association.issued
        mist_association.server_url = server_url

        mist_association.save()

    def getAssociation(self, server_url, handle=None):
        """
        Gets a server url and the handle and finds a matching association that
        has not expired. Expired associations are deleted. The association
        returned is the one with the most recent issuing timestamp.
        """

        query = {'server_url': server_url}
        if handle:
            query.update({'handle': handle.encode('hex')})
        try:
            mist_associations = MistAssociation.objects(**query)
        except me.DoesNotExist:
            mist_associations = []

        filtered_mist_assocs = []

        for assoc in mist_associations:
            if assoc.is_expired():
                assoc.delete()
            else:
                filtered_mist_assocs.append(assoc)

        filtered_mist_assocs = sorted(filtered_mist_assocs,
                                      key=lambda assoc: assoc.issued,
                                      reverse=True)

        if len(filtered_mist_assocs) > 0:
            mist_assoc = filtered_mist_assocs[0]
            association = Association(handle=mist_assoc.handle.decode('hex'),
                                      secret=mist_assoc.secret.decode('hex'),
                                      issued=mist_assoc.issued,
                                      lifetime=mist_assoc.lifetime,
                                      assoc_type=mist_assoc.assoc_type)
            return association

        return None

    def removeAssociation(self, server_url, handle):
        """
        This method removes the matching association if it's found,
        and returns whether the association was removed or not.
        """

        try:
            mist_associations = MistAssociation.objects(server_url=server_url,
                                                        handle=handle.encode('hex'))
        except me.DoesNotExist:
            return False

        for assoc in mist_associations:
            assoc.delete()

        return len(mist_associations) > 0

    def useNonce(self, server_url, timestamp, salt):
        """Called when using a nonce.
        This method should return C{True} if the nonce has not been
        used before, and store it for a while to make sure nobody
        tries to use the same value again.  If the nonce has already
        been used or the timestamp is not current, return C{False}.
        You may use L{openid.store.nonce.SKEW} for your timestamp window.
        """

        if is_nonce_old(timestamp):
            return False

        try:
            mist_nonces = MistNonce.objects(server_url=server_url, salt=salt,
                                            timestamp=timestamp)
        except me.DoesNotExist:
            mist_nonces = []

        if len(mist_nonces) == 0:
            print "Timestamp = %s" % timestamp
            MistNonce(server_url=server_url, salt=salt, timestamp=timestamp).save()
            return True

        return False

    def cleanupNonces(self):
        """Remove expired nonces from the store.
        Discards any nonce from storage that is old enough that its
        timestamp would not pass L{useNonce}.
        This method is not called in the normal operation of the
        library.  It provides a way for store admins to keep
        their storage from filling up with expired data.
        @return: the number of nonces expired.
        @returntype: int
        """
        try:
            mist_nonces = MistNonce.objects()
        except me.DoesNotExist:
            mist_nonces = []

        counter = 0
        for nonce in mist_nonces:
            if nonce.is_old():
                nonce.delete()
                counter += 1

        return counter

    def cleanupAssociations(self):
        """Remove expired associations from the store.
        This method is not called in the normal operation of the
        library.  It provides a way for store admins to keep
        their storage from filling up with expired data.
        @return: the number of associations expired.
        @returntype: int
        """
        try:
            mist_associations = MistAssociation.objects()
        except me.DoesNotExist:
            mist_associations = []

        counter = 0
        for assoc in mist_associations:
            if assoc.is_expired():
                assoc.delete()
                counter += 1

        return counter

    def cleanup(self):
        """Shortcut for C{L{cleanupNonces}()}, C{L{cleanupAssociations}()}.
        This method is not called in the normal operation of the
        library.  It provides a way for store admins to keep
        their storage from filling up with expired data.
        """
        return self.cleanupNonces(), self.cleanupAssociations()
