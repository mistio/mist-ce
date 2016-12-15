"""Tests Script models and Controllers"""


def test_edit(script):

    print "script data: %s" % script.as_dict()
    # edit
    name = script.name + '_edited'
    print "edit script with name %s" % name
    script.ctl.edit(name)
    assert name == script.name, "Edit name failed!"
    print "edit name succeeded %s" % script.name

    description = 'my description for script'
    script.ctl.edit(description=description)
    assert description == script.description, "Edit description failed!"
    print "edit description succeeded"


def test_get_file(script):
    # get_file
    print "test get_file"
    result = script.ctl.get_file()
    assert result, "Something bad happened"
    print "get_file succeeded"
