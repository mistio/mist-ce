(function($) {
    $.fn.mdPopup = function(options) {
        if (options == 'open') {
            $(this).addClass('md-show');
            info('open modal');
        }

        if (options == 'close') {
            $(this).removeClass('md-show');
            info('close modal');
        }
    };
}(jQuery));
