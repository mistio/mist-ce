define('app/controllers/machine_shell', ['app/models/command', 'ember'],
    /**
     * Machine Shell Controller
     *
     * @returns Class
     */
    function (Command) {
        return Ember.Object.extend(Ember.Evented, {

            /**
             *  Properties
             */

            command: null,
            machine: null,
            commandHistoryIndex: -1,


            /**
             *
             *  Methods
             *
             */

            open: function (machine) {
                this._clear();
                this.set('machine', machine);

                // Get the first ipv4 public ip to connect to
                var host = '';
                for (var i=0;i<machine.public_ips.length;i++){
                    if (machine.public_ips[i].search(':') == -1){
                        host = machine.public_ips[i];
                    }

                }
                if (host == '')
                    return false;

                // Open shell socket
                Mist.set('shell', Socket({
                    namespace: '/shell',
                    keepAlive: false,
                }));

                $('.ui-footer').hide(500);
                $('#machine-shell-popup').on('popupafteropen',
                    function(){
                        $('#machine-shell-popup').off('blur');
                        $(document).off('focusin');
                    }
                ).popup( "option", "dismissible", false ).popup('open');

                $(window).on('resize', function(){
                    var w, h, // Estimated width & height
                        wc, hc;  // Width - Height constrained
                        fontSize=18; // Initial font size before adjustment

                    while (true){
                        wc = hc = false;
                        $('.fontSizeTest').css('font-size', fontSize + 'px');

                        w = $('.fontSizeTest').width() * 80;
                        h = $('.fontSizeTest').height() * 24;

                        if (w > window.innerWidth - 46){
                            // log('width constrained');
                            wc = true;
                        }

                        if (h > window.innerHeight-virtualKeyboardHeight() - 135){ //42.4 + 16 + 8 + 1 + 11.2 + 20 + 11.2 + 1 + 8 + 16
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
                    $('#machine-shell-popup-popup').css('left', ((window.innerWidth - $('#machine-shell-popup-popup').width())/2)+'px');

                    if (!Terminal._textarea)
                        $('.terminal').focus();

                    // Make the hidden textfield focusable on android
                    if (Mist.term && Mist.term.isAndroid){
                        $(Terminal._textarea).width('100%');
                        $(Terminal._textarea).height($('#shell-return').height() + 60);
                    }

                    return true;
                });

                var term = new Terminal({
                  cols: 80,
                  rows: 24,
                  screenKeys: true
                });


                term.on('data', function(data) {
                    Mist.shell.emit('shell_data', data);
                });

                term.open(document.getElementById('shell-return'));

                var payload = {'backend_id': machine.backend.id,
                               'machine_id': machine.id,
                               'host': host
                               };
                Mist.shell.emit('shell_open', payload);
                Mist.shell.firstData = true;
                Mist.shell.on('shell_data', function(data){
                    term.write(data);
                    if (Mist.shell.firstData){
                        $('.terminal').focus();
                        Mist.shell.firstData = false;
                    }
                });
                term.write('Connecting to ' + host + '...\r\n');
                Mist.set('term', term);

                Ember.run.next(function(){
                    $(window).trigger('resize');
                });

                if(Terminal._textarea) {
                    // iOS virtual keyboard focus fix
                    $(document).off('focusin');

                    // Tap should trigger resize on Android for virtual keyboard to appear
                    if (Mist.term && Mist.term.isAndroid){
                        $('#shell-return').bind('tap',function(){
                            $(window).trigger('resize');
                        });
                    }
                    $(Terminal._textarea).show();
                }

            },

            close: function () {
                warn('closing shell');
                Mist.shell.emit('shell_close');
                Mist.term.destroy();
                Mist.shell.disconnect();
                $('#machine-shell-popup').popup('close');
                $(window).off('resize');
                this._clear();
                $('.ui-footer').show(500);
                if (Terminal._textarea)
                    $(Terminal._textarea).hide();

            },

            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                Ember.run(this, function () {
                    this.set('machine', null);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            },


            /**
             *
             *  Observers
             *
             */

            machinesObserver: function () {
                Ember.run.once(this, '_updateActions');
            }.observes('machines')
        });
    }
);
