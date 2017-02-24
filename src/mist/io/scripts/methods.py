from mist.io.scripts.models import Script
from mist.io.tag.methods import get_tags_for_resource


def list_scripts(owner):
    scripts = Script.objects(owner=owner, deleted=None)
    script_objects = []
    for script in scripts:
        script_object = script.as_dict_old()
        script_object["tags"] = get_tags_for_resource(owner, script)
        script_objects.append(script_object)
    return script_objects


def filter_list_scripts(auth_context, perm='read'):
    """Return a list of scripts based on the user's RBAC map."""
    scripts = list_scripts(auth_context.owner)
    if not auth_context.is_owner():
        scripts = [script for script in scripts if script['id'] in
                   auth_context.get_allowed_resources(rtype='scripts')]
    return scripts
