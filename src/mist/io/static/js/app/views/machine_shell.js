define('app/views/machine_shell', ['app/views/popup', 'term'],
    //
    //  Machine Shell View
    //
    //  @returns Class
    //
    function (PopupView, Term) {

        'use strict';

        var MIN_TERM_ROWS = 24;
        var MIN_TERM_COLUMNS = 80;

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
                // Disable page scroll
                $('.ui-page-active')
                    .css('height', '100%')
                    .css('overflow-y', 'hidden');
            },


            close: function () {
                this._super();
                this.unhandleWindowResize();
                $('.ui-footer').slideDown(500);
                // Re-enable page scroll
                $('.ui-page-active')
                    .css('height', 'auto')
                    .css('overflow-y', 'auto');
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
            Ember.run.later(function () {
                windowResizeHandler(null, true);
                Mist.machineShellController.connect();
            }, 100)
        }


        function heavyWeightCalibration () {

            var shell = $('#machine-shell-popup #shell-return');
            shell = {
                width: shell.width(),
                height: shell.height(),
                ptop: shell.css('padding-top').replace('px', ''),
                pleft: shell.css('padding-left').replace('px', ''),
                pright: shell.css('padding-right').replace('px', ''),
                pbottom: shell.css('padding-bottom').replace('px', ''),
            };

            var backBtn = $('#machine-shell-popup .ui-btn');
            backBtn = {
                height: backBtn.height(),
                ptop: backBtn.css('padding-top').replace('px', ''),
                pbottom: backBtn.css('padding-bottom').replace('px', ''),
            };

            var size = {
                width: Math.floor(shell.width - shell.pleft - shell.pright),
                height: Math.floor(shell.height - shell.ptop - shell.pbottom -
                    backBtn.height - backBtn.ptop - backBtn.pbottom)
            };

            // Set font size to the default of 1em and then get it's
            // value in pixels because it may vary across platforms
            var fontSize = $('#font-test')
                .css('font-size', '1em')
                .css('font-size');

            // Calculate how many columns fit in the shell
            var numOfColumns = maxCharsInWidth(fontSize, size.width);

            // Calculate how many rows fit in the shell
            var numOfRows = maxLinesInHeight(fontSize, size.height);

            // Calculate optimal font size
            while (numOfColumns < MIN_TERM_COLUMNS || numOfRows < MIN_TERM_ROWS) {
                fontSize = (fontSize.replace('px', '') - 1) + 'px';
                numOfColumns = maxCharsInWidth(fontSize, size.width);
                numOfRows = maxLinesInHeight(fontSize, size.height);
            }

            $('#shell-return')
                .css('font-size', fontSize)
                .css('line-height', fontSize);

            Mist.machineShellController.set('cols', numOfColumns);
            Mist.machineShellController.set('rows', numOfRows);
        }


        function lightWeightCalibration () {
            var w, h, // Estimated width & height
                wc, hc;  // Width - Height constrained
            var fontSize=18; // Initial font size before adjustment
            var fontTest = $('#font-test').text('-');

            while (true) {
                wc = hc = false;

                fontTest.css('font-size', fontSize + 'px');

                w = fontTest.width() * 80;
                h = fontTest.height() * 24;

                if (w > window.innerWidth - 46)
                    wc = true;
                if (h > window.innerHeight-virtualKeyboardHeight() - 135)//42.4 + 16 + 8 + 1 + 11.2 + 20 + 11.2 + 1 + 8 + 16  // Serously?
                    hc = true;

                if ((!wc && !hc) || fontSize < 7)
                    break;

                --fontSize;
            }

            $('#shell-return').css('font-size', fontSize + 'px');

            Mist.machineShellController.set('cols', 80);
            Mist.machineShellController.set('rows', 24);
        }

        var resizeLock;

        function windowResizeHandler (e, force) {

            function calibrateShell () {

                if (Mist.isClientMobile)
                    lightWeightCalibration();
                else
                    heavyWeightCalibration();

                if (!Terminal._textarea)
                    $('.terminal').focus();

                // Make the hidden textfield focusable on android
                if (Mist.term && Mist.term.isAndroid) {
                    $(Terminal._textarea).width('100%');
                    $(Terminal._textarea).height($('#shell-return').height() + 60);
                }
            }

            if (force) {
                calibrateShell();
                return;
            }

            clearTimeout(resizeLock);
            resizeLock = setTimeout(calibrateShell, 500);
        };
    }
);

