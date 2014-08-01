define('app/controllers/machine_shell', ['app/models/command', 'ember' , 'term'],
    //
    //  Machine Shell Controller
    //
    //  @returns Class
    //
    function (Command) {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            view: null,
            machine: null,


            //
            //
            //  Methods
            //
            //


            open: function (machine) {
                //info(Terminal);
                this._clear();
                this.set('machine', machine);

                // Get the first ipv4 public ip to connect to
                var host = '';
                machine.public_ips.forEach(function (ip) {
                    if (ip.search(':') == -1)
                        host = ip;
                });
                if (!host) {
                    this.close();
                    return;
                }

                // Open shell socket
                Mist.set('shell', Socket({
                    namespace: '/shell',
                    keepAlive: false,
                }));

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
                this.view.open();
            },

            close: function () {
                warn('closing shell');
                this.view.close();
                Ember.run.later(this, function () {
                    Mist.shell.emit('shell_close');
                    Mist.term.destroy();
                    Mist.shell.socket.disconnect();
                    this._clear();
                    if (Terminal._textarea)
                        $(Terminal._textarea).hide();
                }, 500);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                Ember.run(this, function () {
                    this.set('machine', null);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            }
        });
    }
);
