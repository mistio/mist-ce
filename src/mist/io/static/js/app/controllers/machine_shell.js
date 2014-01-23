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
                $('#machine-shell-popup').popup('open');
            },


            close: function () {
                $('#machine-shell-popup').popup('close');
                this._clear();
            },


            submit: function(timeout) {

                var machine = this.machine;
                if (!machine || !machine.probed || !this.command) {
                    return;
                }

                var commandHistory = machine.commandHistory;
                var command = Command.create({
                    'id'             : machine.backend.id + machine.id + commandHistory.length,
                    'command'        : this.command,
                    'response'       : '',
                    'pendingResponse': true,
                });
                
                // Modify machine's command history
                commandHistory.unshiftObject(command);
                
                // Construct request
                var url = '/backends/' + machine.backend.id + '/machines/' + machine.id + '/shell';
                var host = machine.getHost();
                var params = {
                    'host'      : host,
                    'command'   : command.command,
                    'command_id': command.id
                };
                if (timeout)
                    params.timeout = timeout;

                function EncodeQueryData(data)
                {
                   var ret = [];
                   for (var d in data)
                      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
                   return ret.join('&');
                }
                url = url + '?' + EncodeQueryData(params);

                $('#hidden-shell').append(
                    '<iframe id="' + command.id +'" src="' + url + '"></iframe>'
                );
                
                this.set('command', '');
                this.set('commandHistoryIndex', -1);
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
