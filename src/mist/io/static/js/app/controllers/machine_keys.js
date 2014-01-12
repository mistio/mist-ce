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

            view: null,
            machine: null,
            callback: null,

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


            close: function () {
                $('#machine-keys-panel').panel('close');
                this._clear();
            },


            associate: function (key, callback) {
                key.associate(this.machine, callback);
            },


            probe: function(key, callback) {
                this.machine.probe(key.id, callback);
            },

            disassociate: function(key, callback) {
                key.disassociate(this.machine, callback);
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
                });
            },


            _updateKeys: function () {
                if (!this.machine) return;
                
                var that = this;
                Ember.run(function () {
                    var found = false;
                    var newAssociatedKeys = [];
                    var newNonAssociatedKeys = [];
                    Mist.keysController.content.forEach(function (key) {
                        found = false;
                        key.machines.some(function (machine) {
                            if (that.machine.id == machine[1] && that.machine.backend.id == machine[0]) {
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


            /**
             * 
             *  Observers
             * 
             */

            machineObserver: function () {
                Ember.run.once(this, '_updateKeys');
            }.observes('machine')
        });
    }
);
