define('app/views/machine_shell', ['app/views/popup', 'term'],
    //
    //  Machine Shell View
    //
    //  @returns Class
    //
    function (PopupView, Term) {

        'use strict';

        return PopupView.extend({


            //
            //
            // Initialization
            //
            //


            load: function () {
                this.handlePopupOpen();
            }.on('didInsertElement'),


            unload: function () {
                this.unhandlePopupOpen();
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            open: function () {
                this._super();
                this.handleWindowResize();
                $('.ui-footer').slideUp(500);
            },


            close: function () {
                this._super();
                this.unhandleWindowResize();
                $('.ui-footer').slideDown(500);
            },


            handlePopupOpen: function () {
                $(this.popupId).on('popupafteropen', popupOpenHandler);
            },


            unhandlePopupOpen: function () {
                $(this.popupId).off('popupafteropen', popupOpenHandler);
            },


            handleWindowResize: function () {
                $(window).on('resize', windowResizeHandler);
            },


            unhandleWindowResize: function () {
                $(window).off('resize', windowResizeHandler);
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function() {
                    Mist.machineShellController.close();
                }
            }
        });


        function popupOpenHandler (e) {
            $(e.currentTarget).off('blur');
            $(document).off('focusin');
        };


        function windowResizeHandler (e) {
            var w, h, // Estimated width & height
                wc, hc;  // Width - Height constrained
            var fontSize=18; // Initial font size before adjustment

            while (true) {
                wc = hc = false;
                $('.fontSizeTest').css('font-size', fontSize + 'px');

                w = $('.fontSizeTest').width() * 80;
                h = $('.fontSizeTest').height() * 24;

                if (w > window.innerWidth - 46){
                    // log('width constrained');
                    wc = true;
                }

                if (h > window.innerHeight-virtualKeyboardHeight() - 135){ //42.4 + 16 + 8 + 1 + 11.2 + 20 + 11.2 + 1 + 8 + 16  // Serously?
                    // log('height constrained');
                    hc = true;
                }

                if ((!wc && !hc) || fontSize <= 6){
                    break;
                }

                fontSize -= 1;
            }

            $('#shell-return').css('font-size', fontSize + 'px');

            // Put popup it in the center
            $('#machine-shell-popup').css('left', ((window.innerWidth - $('#machine-shell-popup').width())/2)+'px');

            if (!Terminal._textarea)
                $('.terminal').focus();

            // Make the hidden textfield focusable on android
            if (Mist.term && Mist.term.isAndroid){
                $(Terminal._textarea).width('100%');
                $(Terminal._textarea).height($('#shell-return').height() + 60);
            }
        };
    }
);

