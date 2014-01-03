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


            close: function () {
                $('#machine-keys-panel').panel('close');
                this._clear();
            },



            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                Ember.run(this, function() {
                    this.set('machine', null);
                    this.set('callback', null);
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            }
        });
    }
);
