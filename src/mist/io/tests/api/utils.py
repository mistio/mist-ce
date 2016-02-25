from pytest import raises


def safe_repr(obj, short=False):
    try:
        result = repr(obj)
    except Exception:
        result = object.__repr__(obj)
    if not short or len(result) < 80:
        return result
    return result[:80] + ' [truncated]...'


def assert_equal(first, second, msg=None):
    """Fail if the two objects are unequal as determined by the '=='
       operator.
    """
    if type(first) != type(second):
        raise AssertionError("%s and %s are not of the same type" % (safe_repr(first), safe_repr(second)))
    if type(first) == dict and type(second) == dict:
        assert_dict_equal(first, second, msg)
    elif type(first) == list and type(second) == list:
        assert_list_equal(first, second, msg)
    elif type(first) == tuple and type(second) == tuple:
        assert_tuple_equal(first, second, msg)
    elif type(first) == set and type(second) == set:
        assert_set_equal(first, second, msg)
    elif type(first) == frozenset and type(second) == frozenset:
        assert_set_equal(first, second, msg)
    else:
        assert first == second, msg


def assert_not_equal(first, second, msg=None):
    """Fail if the two objects are equal as determined by the '!='
       operator.
    """
    assert first != second, msg


def assert_is_none(obj, msg=None):
    assert obj is None, msg


def assert_is_not_none(obj, msg=None):
    """Included for symmetry with assertIsNone."""
    assert obj is not None, msg


def assert_in(member, container, msg=None):
    """Just like self.assertTrue(a in b), but with a nicer default message."""
    if not msg:
        msg = '%s not found in %s' % (safe_repr(member),
                                              safe_repr(container))
    assert member in container, msg


def assert_not_in(member, container, msg=None):
    """Just like self.assertTrue(a not in b), but with a nicer
    default message.
    """
    if not msg:
        msg = '%s not found in %s' % (safe_repr(member),
                                              safe_repr(container))
    assert member not in container, msg


def assert_is_instance(obj, cls, msg=None):
    """Same as self.assertTrue(isinstance(obj, cls)), with a nicer
    default message."""
    if not msg:
        msg = '%s is not an instance of %r' % (safe_repr(obj), cls)
    assert isinstance(obj, cls), msg


def assert_not_is_instance(obj, cls, msg=None):
    """Same as self.assertTrue(isinstance(obj, cls)), with a nicer
    default message."""
    if not msg:
        msg = '%s is an instance of %r' % (safe_repr(obj), cls)
    assert not isinstance(obj, cls), msg


def assert_less(a, b, msg=None):
    """Just like self.assertTrue(a < b), but with a nicer default message."""
    if not msg:
        msg = '%s not less than %s' % (safe_repr(a), safe_repr(b))
    assert a < b, msg


def assert_less_or_equal(a, b, msg=None):
    """Just like self.assertTrue(a < b), but with a nicer default message."""
    if not msg:
        msg = '%s not less or equal than %s' % (safe_repr(a), safe_repr(b))
    assert a <= b, msg


def assert_greater(a, b, msg=None):
    """Just like self.assertTrue(a < b), but with a nicer default message."""
    if not msg:
        msg = '%s not greater than %s' % (safe_repr(a), safe_repr(b))
    assert a > b, msg


def assert_greater_or_equal(a, b, msg=None):
    """Just like self.assertTrue(a < b), but with a nicer default message."""
    if not msg:
        msg = '%s not greater or equal than %s' % (safe_repr(a), safe_repr(b))
    assert a >= b, msg


def assert_sequence_equal(seq1, seq2, msg=None, seq_type=None, strict=False):
    """An equality assertion for ordered sequences (like lists and tuples).

    For the purposes of this function, a valid ordered sequence type is one
    which can be indexed, has a length, and has an equality operator.

    Args:
        seq1: The first sequence to compare.
        seq2: The second sequence to compare.
        seq_type: The expected datatype of the sequences, or None if no
            datatype should be enforced.
        msg: Optional message to use on failure instead of a list of
            differences.
        strict: If strict set to true then the order of the elements will also
         be taken into account when deciding whether or not the sequences are
         equal. Be careful to enable strict mode only with data types that
         provide guarantees about the iteration of their elements.
    """
    if seq_type is not None:
        seq_type_name = seq_type.__name__
        assert isinstance(seq1, seq_type), 'First sequence is not a %s: %s' % (seq_type_name, safe_repr(seq1))
        assert isinstance(seq2, seq_type), 'Second sequence is not a %s: %s' % (seq_type_name, safe_repr(seq2))
    else:
        seq_type_name = "sequence"

    differing = None
    len1 = 0
    len2 = 0
    try:
        len1 = len(seq1)
    except (TypeError, NotImplementedError):
        differing = 'First %s has no length. Non-sequence?' % seq_type_name

    if differing is None:
        try:
            len2 = len(seq2)
        except (TypeError, NotImplementedError):
            differing = 'Second %s has no length. Non-sequence?' % (
                    seq_type_name)

    if differing is None:
        if len1 == len2 and strict:
            if len(list(set(seq1) - set(seq2))) == 0:
                if not strict:
                    return True
                else:
                    for i in range(len1):
                        if seq1[i] != seq2[i]:
                            assert False, "Sequences have the same elements " \
                                          "but not the same order:" \
                                          "\n%s\n%s" % (safe_repr(seq1),
                                                        safe_repr(seq2))
        if len1 > len2:
            differing = list(set(seq1) - set(seq2))
        else:
            differing = list(set(seq2) - set(seq1))
        if len(differing) == 0:
            return True
        differing = "Sequences differ in these elements: %s" % safe_repr(differing)
    assert False, differing


def assert_list_equal(list1, list2, msg=None):
    """A list-specific equality assertion.

    Args:
        list1: The first list to compare.
        list2: The second list to compare.
        msg: Optional message to use on failure instead of a list of
                differences.

    """
    assert_sequence_equal(list1, list2, msg, seq_type=list)


def assert_tuple_equal(tuple1, tuple2, msg=None):
    """A tuple-specific equality assertion.

    Args:
        tuple1: The first tuple to compare.
        tuple2: The second tuple to compare.
        msg: Optional message to use on failure instead of a list of
                differences.
    """
    assert_sequence_equal(tuple1, tuple2, msg, seq_type=tuple)


def assert_set_equal(set1, set2, msg=None):
    """A set-specific equality assertion.

    Args:
        set1: The first set to compare.
        set2: The second set to compare.
        msg: Optional message to use on failure instead of a list of
                differences.

    """
    assert_sequence_equal(set1, set2, msg=msg, seq_type=set)


def assert_dict_equal(d1, d2, msg=None):
    assert_is_instance(d1, dict, 'First argument is not a dictionary')
    assert_is_instance(d2, dict, 'Second argument is not a dictionary')

    assert d1 == d2, '%s != %s' % (safe_repr(d1, True), safe_repr(d2, True))


def test_utils():
    """This method will test all the assertion utils.
    """
    assert_equal("1", "1")
    assert_equal(1, 1)
    with raises(AssertionError):
        assert_equal("1", 1)

    with raises(AssertionError):
        assert_not_equal("1", "1")
    with raises(AssertionError):
        assert_not_equal(1, 1)
    assert_not_equal("1", 1)

    assert_is_instance(1, int)
    assert_is_instance("1", str)
    assert_is_instance(["1"], list)
    with raises(AssertionError):
        assert_is_instance("1", int)

    with raises(AssertionError):
        assert_is_instance(["1"], dict)

    a = [1, 2, 3, 4]
    b = [1, 2, 3, 4]
    c = [1, 2, 3, 4, 5]
    d = [1, 2, "3", 4]
    assert_list_equal([], [])
    assert_list_equal(a, a)
    assert_list_equal(a, b)
    with raises(AssertionError):
        assert_list_equal(a, None)
    with raises(AssertionError):
        assert_list_equal(None, None)
    with raises(AssertionError):
        assert_list_equal([], a)
    with raises(AssertionError):
        assert_list_equal([], {})
    with raises(AssertionError):
        assert_list_equal(a, c)
    with raises(AssertionError):
        assert_list_equal(a, d)

    a = [1, 2, 4, 3]
    b = [1, 2, 3, 4]
    assert_sequence_equal(a, b, seq_type=list)
    with raises(AssertionError):
        assert_sequence_equal(a, b, seq_type=list, strict=True)

    a = {'a': 'bla', 'b': 'bla', 'c': 'bla'}
    b = {'a': 'bla', 'b': 'bla', 'c': 'bla'}
    c = {'a': 'bla', 'b': 'bla', 'c': 'bla1'}
    d = {'a': 'bla1', 'b': 'bla', 'c': 'bla1'}
    e = {'a': 'bla1', 'b': 'bla', 'c': 'bla1', 'd': 'bla2'}
    assert_dict_equal(a, a)
    assert_dict_equal(a, b)
    with raises(AssertionError):
        assert_dict_equal(a, 1)
    with raises(AssertionError):
        assert_dict_equal(a, "1")
    with raises(AssertionError):
        assert_dict_equal(a, c)
    with raises(AssertionError):
        assert_dict_equal(a, d)
    with raises(AssertionError):
        assert_dict_equal(a, e)

    a = ({'a'})
    b = ({'a', 'b'})
    c = ({'a', 'b'})
    d = ({'a', 'b', 'c', 1})
    e = ({'a', 'b', 'c', '1'})
    assert_set_equal(a, a)
    assert_set_equal(b, c)
    with raises(AssertionError):
        assert_set_equal(a, b)
    with raises(AssertionError):
        assert_set_equal(c, d)
    with raises(AssertionError):
        assert_set_equal(a, [1])
    with raises(AssertionError):
        assert_set_equal(d, e)
    with raises(AssertionError):
        assert_set_equal(a, 'a')
    with raises(AssertionError):
        assert_set_equal(a, 1)

    a = [1, "1", 2, 3]
    b = 1
    c = "1"
    d = "2"
    e = [2, 3]
    assert_in(b, a)
    assert_in(c, a)
    with raises(AssertionError):
        assert_in(d, a)
    with raises(AssertionError):
        assert_in(e, a)

    with raises(AssertionError):
        assert_not_in(b, a)
    with raises(AssertionError):
        assert_not_in(c, a)
    assert_not_in(d, a)
    assert_not_in(e, a)

    a = None
    assert_is_none(None)
    assert_is_none(a)
    with raises(AssertionError):
        assert_is_none([])

    with raises(AssertionError):
        assert_is_not_none(None)
    with raises(AssertionError):
        assert_is_not_none(a)
    assert_is_not_none([])

    assert_less(1, 2)
    assert_less("1", "2")
    assert_less("bla", "blabla")
    with raises(AssertionError):
        assert_less(1, 1)
    assert_less_or_equal(1, 1)
    assert_less_or_equal("1", "1")
    assert_less_or_equal(1, 2)
    assert_less_or_equal("bla", "bla1")
    with raises(AssertionError):
        assert_less_or_equal("bla", "ala")

    assert_greater(2, 1)
    assert_greater("2", "1")
    assert_greater("blabla", "bla")
    with raises(AssertionError):
        assert_greater(1, 1)
    assert_greater_or_equal(1, 1)
    assert_greater_or_equal("1", "1")
    assert_greater_or_equal(2, 1)
    assert_greater_or_equal("bla1", "bla")
    with raises(AssertionError):
        assert_greater_or_equal("ala", "bla")

    a = (1, 1)
    b = (1, 1)
    c = ("1", "2")
    d = ("bla", "blabla")
    e = ("1", "1")

    assert_is_instance(a, tuple)
    with raises(AssertionError):
        assert_is_instance([1], tuple)
    assert_tuple_equal(a, a)
    with raises(AssertionError):
        assert_tuple_equal(a, [1, 1])
    assert_tuple_equal(a, b)
    with raises(AssertionError):
        assert_tuple_equal(a, c)
    with raises(AssertionError):
        assert_tuple_equal(a, d)
    with raises(AssertionError):
        assert_tuple_equal(a, e)
