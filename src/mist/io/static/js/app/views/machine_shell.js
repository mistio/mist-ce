define('app/views/machine_shell', ['app/views/popup'],
    //
    //  Machine Shell View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        var MIN_TERM_ROWS = 24;
        var MIN_TERM_COLUMNS = 80;

        return App.MachineShellComponent = PopupComponent.extend({

            layoutName: 'machine_shell',
            controllerName: 'machineShellController',
            popupId: '#machine-shell',


            //
            // Initialization
            //

            load: function () {
                Ember.run.next(this, function(){
                    $(this.popupId)
                        .on('popupafteropen', afterOpenHandler)
                        .on('popupbeforeposition', beforeOpenHandler)
                        .parent()
                        .addClass(Mist.isClientMobile ? 'mobile' : 'desktop')
                        .addClass(Mist.isClientMobile ? 'huge-popup' : '');
                });
            }.on('didInsertElement'),


            unload: function () {
                $(this.popupId)
                    .off('popupafteropen', afterOpenHandler)
                    .off('popupbeforeposition', beforeOpenHandler);
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            open: function () {
                this.setUpUI();
                this._super();
            },


            close: function () {
                this._super();
                this.cleanUpUI();
            },


            setUpUI: function () {
                lockScroll();
                $('.ui-footer').slideUp(200);
                $(window).on('resize', windowResizeHandler);
            },


            cleanUpUI: function () {
                unlockScroll();
                $('.ui-footer').slideDown(400);
                $(window).off('resize', windowResizeHandler);
            },


            //
            //  Actions
            //

            actions: {
                backClicked: function() {
                    Mist.machineShellController.close();
                }
            }
        });


        var resizeLock;
        function windowResizeHandler () {
            // Prevent shell recalibration if user hasn't stopped resizing the
            // window, which is most probably device rotation or the appearance
            // of the on screen keyboard
            clearTimeout(resizeLock);
            resizeLock = setTimeout(initShell, 1000);
        }

        function afterOpenHandler (e) {
            $(e.currentTarget).off('blur');
            $(document).off('focusin');

            // Initialize shell after popup opens when user is on desktop
            // because dekstop calibration is performance intensive and will
            // delay the popup's appearance, making it look unresponsibe
            Ember.run.next(function () {
                if (!Mist.isClientMobile) initShell();
            });
        }

        function beforeOpenHandler (e) {
            // Initialize shell before popup opens when user is on mobile.
            // Else, the shell will be resized and repositioned while visible
            // and will appear glitchy
            if (Mist.isClientMobile) initShell();
        }

        function initShell () {
            if (Mist.isClientMobile)
                mobileCalibration();
            else
                desktopCalibration();

            Mist.machineShellController.connect();
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
                .css('font-size').replace('px', '') - 0;

            var numOfColumns;
            var numOfRows;

            // Make sure the shell is at least wide/tall enough for
            // the terminal standards
            while (true) {
                fontSize = fontSize - 0.5;
                if (fontSize < 9.5)
                    fontSize = 9;

                numOfColumns = maxCharsInWidth(fontSize, size.width);
                if (numOfColumns < MIN_TERM_COLUMNS && fontSize > 9)
                    continue;

                numOfRows = maxLinesInHeight(fontSize, size.height);
                if (numOfRows < MIN_TERM_ROWS && fontSize > 9)
                    continue;

                break;
            }

            $('#shell-return')
                .css('font-size', fontSize);

            info('calibrating desktop shell at', numOfColumns, numOfRows, fontSize);
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
                .css('font-size', fontSize + 'px');

            // Place popup in the center
            var popup = $('#machine-shell-popup');
            popup.css('left', ((window.innerWidth - popup.width()) / 2) + 'px');

            Mist.machineShellController.set('cols', MIN_TERM_COLUMNS);
            Mist.machineShellController.set('rows', MIN_TERM_ROWS);
        }
    }
);
