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
            cols: null,
            rows: null,
            machine: null,


            //
            //
            //  Methods
            //
            //


            open: function (machine) {
                this._clear();
                this.set('machine', machine);
                // Get the first ipv4 public ip to connect to
                var host = '';
                machine.public_ips.forEach(function (ip) {
                    if (ip.search(':') == -1)
                        host = ip;
                }, this);
                this.set('host', host);
                if (!host)
                    this.close();
                else
                    this.view.open();
            },


            connect: function () {

                // Open shell socket
                Mist.set('shell', Socket({
                    namespace: '/shell',
                    keepAlive: false,
                }));

                var term = new Terminal({
                  cols: this.cols,
                  rows: this.rows,
                  screenKeys: true
                });

                term.on('data', function (data) {
                    Mist.shell.emit('shell_data', data);
                });

                term.open(document.getElementById('shell-return'));

                Mist.shell.emit('shell_open', {
                    backend_id: this.machine.backend.id,
                    machine_id: this.machine.id,
                    host: this.host,
                    cols: this.cols,
                    rows: this.rows,
                });

                Mist.shell.firstData = true;
                Mist.shell.on('shell_data', function (data) {
                    term.write(data);
                    if (Mist.shell.firstData) {
                        $('.terminal').focus();
                        Mist.shell.firstData = false;
                    }
                });

                term.write('Connecting to ' + this.host + '...\r\n');
                Mist.set('term', term);

                if (Terminal._textarea) {

                    // iOS virtual keyboard focus fix
                    $(document).off('focusin');

                    // Tap should trigger resize on Android for virtual keyboard to appear
                    if (Mist.term && Mist.term.isAndroid){
                        $('#shell-return').bind('tap', function() {
                            $(window).trigger('resize');
                        });
                    }
                    $(Terminal._textarea).show();
                }
            },


            close: function () {
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
                    this.set('cols', null);
                    this.set('rows', null);
                    this.set('machine', null);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            }
        });
    }
);
