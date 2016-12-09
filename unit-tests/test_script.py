"""Tests Script models and Controllers"""


def test_edit(script):

    print "script data: %s" % script.as_dict()
    # edit
    name = script.name + '_edited'
    print "edit script with name %s" % name
    script.ctl.edit(name)
    print "succeeded %s" % script.name


def test_get_file(script):
    # get_file
    print "test get_file"
    result = script.ctl.get_file()
    assert result, "Something bad happened"
    print "The file is: %s" % result


