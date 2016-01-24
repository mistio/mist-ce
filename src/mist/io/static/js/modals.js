(function($) {
    $.fn.mdPopup = function(options) {
        if (options == 'open') {
            $(this)
                .addClass('md-show')
                .removeClass('md-hide');
            info('open modal');
        }

        if (options == 'close') {
            $(this)
                .addClass('md-hide')
                .removeClass('md-show');
            info('close modal');
        }
    };
}(jQuery));
