$(document).ready(function() {

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