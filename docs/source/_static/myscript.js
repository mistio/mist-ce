$(document).ready(function() {


    var elements = $('dd');
    for (var i = 0; i < elements.length; ++i) {
        if (elements.eq(i).html() == '') {
            elements.eq(i).html('<p> (no description) </p>')
        }
    }

    $('.section dd').hide();
    $('.section dl > dt').click(function(e) {
        var dd = $(e.currentTarget).parent().find('dd');
        if (dd.css('display') == 'block') {
            dd.slideUp();
        } else {
            dd.slideDown();
        }
    });
});