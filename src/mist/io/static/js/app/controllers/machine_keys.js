define('app/controllers/machine_keys', ['ember'],
    /**
     * Machine Keys Controller
     *
     * @returns Class
     */
    function () {
        return Ember.Object.extend(Ember.Evented, {

            /**
             *  Properties
             */

            user: null,
            port: null,
            view: null,
            machine: null,
            callback: null,
            lastAssocKey: null,


            /**
             *
             *  Initialization
             *
             */

            load: function() {

                // Add event listeners
                Mist.keysController.on('onKeyListChange', this, '_updateKeys');
                Mist.keysController.on('onKeyAssociate', this, '_updateKeys');
                Mist.keysController.on('onKeyDisassociate', this, '_updateKeys');

            }.on('init'),


            /**
             *
             *  Methods
             *
             */

            open: function (machine, callback) {
                $('#machine-keys-panel').panel('open');
                this._clear();
                this.set('machine', machine);
                this.set('callback', callback);
            },


            openKeyList: function (machine, callback) {
                this.set('machine', machine);
                this.set('callback', callback);
                this.view._actions.associateClicked();
            },

            openSSH_Details: function() {

                var user = this.user ? this.user : "root";
                var port = this.port ? this.port : "22";

                $("#machine-userPort-popup .message").text("Cannot connect as " + user + " on port " + port );
                $("#machine-userPort-popup").find("#user").val("");
                $("#machine-userPort-popup").find("#port").val("");
                $("#machine-userPort-popup").popup( "open" );
            },

            closeSSH_Details: function() {

                this._cleanSSH_UserPortPopup();
                $("#machine-userPort-popup").popup( "close" );
            },

            close: function () {
                $('#machine-keys-panel').panel('close');
                this._clear();
            },


            associate: function (key, callback, user, port) {
                this.set('lastAssocKey',key);
                key.associate(this.machine, callback, user, port);
            },


            probe: function(key, callback) {
                this.machine.probe(key.id, callback);
            },


            disassociate: function(key, callback) {
                // Check if this is the last key of the machine
                if (Mist.keysController.getMachineKeysCount(this.machine) == 1) {
                    var machine = this.machine;
                    // Open confirmation just a bit later
                    // so that key actions popup has enough
                    // time to close
                    Ember.run.later(function() {
                        Mist.dialogController.open({
                            type: DIALOG_TYPES.YES_NO,
                            head: 'Disassociate key',
                            body: [
                                {
                                    paragraph: 'You are about to remove the last key associated with "' +
                                    machine.name + '" machine and you won\'t be able to access it anymore. ' +
                                    'Are you sure you want to proceed?'
                                }
                            ],
                            callback: function (didConfirm) {
                                if (didConfirm) {
                                    key.disassociate(machine, callback);
                                }
                            }
                        });
                    }, 300);
                } else {
                    key.disassociate(this.machine, callback);
                }
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                Ember.run(this, function () {

                    this.set('machine', null);
                    this.set('callback', null);

                    this._cleanSSH_UserPortPopup();
                });
            },


            _updateKeys: function () {
                if (!this.machine) return;

                var that = this;
                Ember.run(function () {
                    var found = false;
                    var newAssociatedKeys = [];
                    var newNonAssociatedKeys = [];
                    Mist.keysController.model.forEach(function (key) {
                        found = false;
                        key.machines.some(function (machine) {
                            if (that.machine.id == machine[1] && that.machine.cloud.id == machine[0]) {
                                newAssociatedKeys.push(key);
                                return found = true;
                            }
                        });
                        if (!found) newNonAssociatedKeys.push(key);
                    });
                    that.set('associatedKeys', newAssociatedKeys);
                    that.set('nonAssociatedKeys', newNonAssociatedKeys);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            },

            _cleanSSH_UserPortPopup : function(){

                this.set('lastAssocKey',null);
                this.set('user',null);
                this.set('port',null);

                // TODO Change to children selector for optimize
                $("#machine-userPort-popup").find("#user").val("")
                $("#machine-userPort-popup").find("#port").val("")
            },



            /**
             *
             *  Observers
             *
             */

            machineObserver: function () {
                Ember.run.once(this, '_updateKeys');
            }.observes('machine'),


            portFieldObserver: function(){

                // Allow only numerical values
                if(this.port)
                    this.set('port',this.port.replace(/\D/g, ''));


            }.observes('port')
        });
    }
);
