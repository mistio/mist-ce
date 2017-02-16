from mongoengine import Q
from mist.io.tag.models import Tag
from mist.io.helpers import trigger_session_update
from mist.io.helpers import get_object_with_id


def get_tags_for_resource(owner, resource_obj, *args, **kwargs):
    return [{'key': tag.key, 'value': tag.value} for tag in
            Tag.objects(owner=owner, resource=resource_obj)]


def add_tags_to_resource(owner, resource_obj, tags, *args, **kwargs):
    """
    This function get a list of tags in the form
    [{'key': 'joe', 'value': 'schmoe'}] and will scan the list and update all
    the tags whose keys are present but whose values are different and add all
    the missing ones
    :param owner: the resource owner
    :param resource_obj: the resource object where the tags will be added
    :param tags: list of tags to be added
    """
    # merge all the tags in the list into one dict. this will also make sure
    # that if there are duplicates they will be cleaned up
    tag_dict = dict(tags)

    for tag_obj in Tag.objects(owner=owner, resource=resource_obj):
        # if any of the tag keys is already present check if it's value should
        # be changed and remove it from the tag_dict
        if tag_obj.key in tag_dict:
            if tag_obj.value != tag_dict[tag_obj.key]:
                tag_obj.value = tag_dict[tag_obj.key]
                tag_obj.save()
            del tag_dict[tag_obj.key]

    # remaining tags in tag_dict have not been found in the db so add them now
    for key, value in tag_dict.iteritems():
        Tag(owner=owner, resource=resource_obj, key=key, value=value).save()

    # SEC
    owner.mapper.update(resource_obj)

    # FIXME: The fact that a session update is triggered at this point may
    # result in re-updating the RBAC Mappings twice for the given resource
    # for no f*** reason.
    rtype = resource_obj._meta["collection"]

    trigger_session_update(owner,
                           [rtype + 's' if not rtype.endswith('s') else rtype])


def remove_tags_from_resource(owner, resource_obj, tags, *args, **kwargs):
    """
    This function get a list of tags in the form [{'key': 'joe'}] or
    [{'key': 'joe', 'value': 'schmoe'}] and will delete them from the resource
    :param owner: the resource owner
    :param resource_obj: the resource object where the tags will be added
    :param rtype: resource type
    :param tags: list of tags to be deleted
    """
    # ensure there are no duplicate tag keys because mongoengine will
    # raise exception for duplicates in query
    key_list = list(set(tags))

    # create a query that will return all the tags with
    query = reduce(lambda q1, q2: q1.__or__(q2),
                   map(lambda key: Q(key=key), key_list))

    Tag.objects(Q(owner=owner) & Q(resource=resource_obj) & (query)).delete()

    # SEC
    owner.mapper.update(resource_obj)

    rtype = resource_obj._meta["collection"]

    trigger_session_update(owner,
                           [rtype + 's' if not rtype.endswith('s') else rtype])


def resolve_id_and_get_tags(owner, rtype, rid, *args, **kwargs):
    """
    This call will try to fetch the object of type rtype from the db with id
    rid. If the object is of type machine, image, network or location the
    cloud_id must also be provided in the kwargs. If the resource type is
    machine then the machine_id must be provided and not the object id. Whether
    or not the owner has the necessary credentials to get the tags of the
    resource is left to the caller of this function to validate.
    :param owner: the owner of the resource
    :param rtype: resource type
    :param rid: resource id
    :return: the tags of this resource
    """
    resource_obj = get_object_with_id(owner, rid, rtype, *args, **kwargs)
    return get_tags_for_resource(owner, resource_obj)


def resolve_id_and_set_tags(owner, rtype, rid, tags, *args, **kwargs):
    """
    :param owner: the owner of the resource
    :param rtype: resource type
    :param rid: resource id
    :param tags: resource tags to be added or updated
    :return: the tags to be added or updated to this resource
    """
    resource_obj = get_object_with_id(owner, rid, rtype, *args, **kwargs)
    return add_tags_to_resource(owner, resource_obj, tags, *args,
                                **kwargs)


def resolve_id_and_delete_tags(owner, rtype, rid, tags, *args, **kwargs):
    """
    :param owner: the owner of the resource
    :param rtype: resource type
    :param rid: resource id
    :param tags: resource id
    :return: the tags to be deleted from this resource
    """
    resource_obj = get_object_with_id(owner, rid, rtype, *args, **kwargs)
    return remove_tags_from_resource(owner, resource_obj, tags, *args, **kwargs)


def modify_security_tags(auth_context, tags, resource=None):
    """
    This method splits the resources' tags in security and non-security
    groups. Security tags are part of team policies. Such tags should only
    be modified by organization owners in order to enforce team policies.
    If a team member attempts to edit a security tag, an UnauthorizedError
    will be thrown
    :param tags: the new tags dict
    :param resource: the resource on which the tags are going to be applied
    :return: False, if a security tag has been modified in the new tags
    dict by someone other than the organization owner, otherwise True
    """
    # private context
    if auth_context.org is None:
        return True

    if auth_context.is_owner():
        return True
    else:
        rtags = Tag.objects(owner=auth_context.owner.id,
                            resource=resource).only('key', 'value')
        rtags = {rtag.key: rtag.value for rtag in rtags}
        security_tags = auth_context.get_security_tags()
        # check whether the new tags tend to modify any of the security_tags
        for security_tag in security_tags:
            for key, value in security_tag.items():
                if key not in rtags.keys():
                    if key in tags.keys():
                        return False
                else:
                    if key not in tags.keys():
                        return False
                    elif value != tags[key]:
                        return False
        return True


def delete_security_tag(auth_context, tag_key):
    """
    This method checks whether the tag to be deleted belongs to the
    secure tags group
    :param tag_key: the key of the tag to be removed
    :return: False in case a security tag is about to be deleted
    """
    # private context
    if auth_context.org is None:
        return True

    if auth_context.is_owner():
        return True
    else:
        security_tags = auth_context.get_security_tags()
        for security_tag in security_tags:
            for key, value in security_tag.items():
                if key == tag_key:
                    return False
        return True