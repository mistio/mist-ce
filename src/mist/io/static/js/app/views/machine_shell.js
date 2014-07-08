define('app/views/machine_shell', ['app/views/popup', 'ember'],
    //
    //  Machine Shell View
    //
    //  @returns Class
    //
    function(PopupView) {

        'use strict';

        return PopupView.extend({


            //
            //
            //  Methods
            //
            //


            open: function () {

                $('#machine-shell').on('popupafteropen',
                    function(){
                        $('#machine-shell').off('blur');
                        $(document).off('focusin');
                    }
                ).popup( "option", "dismissible", false );

                this._super();

                $('.ui-footer').slideUp(500);

                $(window).on('resize', function(){
                    var w, h, // Estimated width & height
                        wc, hc;  // Width - Height constrained
                    var fontSize=18; // Initial font size before adjustment

                    while (true){
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

                    return true;
                });
            },


            close: function () {

                this._super();
                $('.ui-footer').slideDown(500);
            },


            clear: function () {

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
    }
);

