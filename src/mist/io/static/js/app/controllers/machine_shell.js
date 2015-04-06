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
            isOpen: null,
            machine: null,


            //
            //
            //  Methods
            //
            //


            open: function (machine) {

                this._clear();
                this.setProperties({
                    machine: machine,
                    isOpen: true,
                });

                // Get the first ipv4 public ip to connect to
                machine.public_ips.forEach(function (ip) {
                    if (ip.search(':') == -1)
                        this.set('host', ip);
                }, this);

                if (this.host)
                    this.view.open();
                else
                    this.close();

            },


            connect: function () {

                if (this.connected) {
                    this.resize();
                    return;
                }

                this.set('connected', true);

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
                    provider: this.machine.backend.provider,
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

                if (!Terminal._textarea)

                    $('.terminal').focus();

                else {

                    // iOS virtual keyboard focus fix
                    $(document).off('focusin');

                    // Make the hidden textfield focusable on android
                    if (Mist.term && Mist.term.isAndroid)
                        $(Terminal._textarea)
                            .css('top', '1%')
                            .css('left', 0)
                            .width('100%')
                            .height($('#shell-return').height());

                    $(Terminal._textarea).show();
                }
            },


            resize: function () {
                Mist.term.resize(this.cols, this.rows);
                Mist.shell.emit('shell_resize',this.cols, this.rows);
            },


            close: function () {
                this.view.close();
                Ember.run.later(this, function () {
                    Mist.term.destroy();
                    Mist.shell.disconnect();
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
                    this.setProperties({
                        cols: null,
                        rows: null,
                        machine: null,
                        connected: null,
                        isOpen: false,
                    });
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            }
        });
    }
);
