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
                this.setClientSpecificClass();
                this.handleWindowResize();
                $('.ui-footer').slideUp(500);
                // Disable page scroll
                $('.ui-page-active')
                    .css('height', '100%')
                    .css('overflow-y', 'hidden');
                this._super();
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


            setClientSpecificClass: function () {
                if (Mist.isClientMobile)
                    $('#machine-shell-popup').addClass('mobile');
                else
                    $('#machine-shell-popup').addClass('desktop');
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


        var resizeLock;
        function windowResizeHandler () {
            // Prevent shell recalibration if user hasn't
            // stopped resizing the window
            clearTimeout(resizeLock);
            resizeLock = setTimeout(calibrateShell, 500);
        };


        function popupOpenHandler (e) {
            $(e.currentTarget).off('blur');
            $(document).off('focusin');
            Ember.run.next(function () {
                calibrateShell();
                Mist.machineShellController.connect();
            }, 100)
        }


        function calibrateShell () {

            if (Mist.isClientMobile)
                mobileCalibration();
            else
                desktopCalibration();
        }


        function desktopCalibration () {

            // Heavy (performance wise) callibration of shell
            // Takes up the whole window and uses as many chars
            // fit in the shell area

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
            // value in pixels because it may vary across platforms/browsers
            var fontSize = $('#font-test')
                .css('font-size', '1em')
                .css('font-size');

            // Calculate how many columns fit in the shell
            var numOfColumns = maxCharsInWidth(fontSize, size.width);

            // Calculate how many rows fit in the shell
            var numOfRows = maxLinesInHeight(fontSize, size.height);

            // Make sure the shell is at least wide/tall enough for
            // the terminal standards
            while (numOfColumns < MIN_TERM_COLUMNS || numOfRows < MIN_TERM_ROWS) {
                fontSize = (fontSize.replace('px', '') - 0.5) + 'px';
                numOfColumns = maxCharsInWidth(fontSize, size.width);
                numOfRows = maxLinesInHeight(fontSize, size.height);
            }

            $('#shell-return')
                .css('font-size', fontSize)
                .css('line-height', fontSize);

            Mist.machineShellController.set('cols', numOfColumns);
            Mist.machineShellController.set('rows', numOfRows);
        }


        function mobileCalibration () {

            // Light (performance wise) callibration of shell
            // Takes up only enough area to fit a standard sized
            // terminal

            var fontSize = 19;   // Initial font size before adjustment
            var fontTest = $('#font-test').text('-');

            var eWidth, eHeight; // Estimated width & height

            // 46 & 135 are some numbers thar just work... don't touch them!
            var maxWidth = window.innerWidth - 46;
            var maxHeight = window.innerHeight - 135 - virtualKeyboardHeight();

            do {
                --fontSize;

                // Don't get smaller font size than 6
                if (fontSize == 6) break;

                fontTest.css('font-size', fontSize + 'px');

                // Get estimated width and height for fontSize
                eWidth = fontTest.width() * MIN_TERM_COLUMNS;
                eHeight = fontTest.height() * MIN_TERM_ROWS;

            } while (eWidth > maxWidth || eHeight > maxHeight);

            $('#shell-return')
                .css('font-size', fontSize + 'px')
                .css('line-height', fontSize + 'px');

            Ember.run.next(function () {
                // Place popup in the center
                var popup = $('#machine-shell-popup')
                popup.css('left', ((window.innerWidth - popup.width()) / 2) + 'px');
            });

            Mist.machineShellController.set('cols', MIN_TERM_COLUMNS);
            Mist.machineShellController.set('rows', MIN_TERM_ROWS);
        }
    }
);

