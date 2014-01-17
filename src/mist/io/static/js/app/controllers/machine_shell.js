define('app/controllers/machine_shell', ['ember'],
    /**
     * Machine Shell Controller
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
                $('#machine-shell-popup').popup('open');
                this._clear();
                this.set('machine', machine);
                this.set('callback', callback);
                this.view.set('machine', machine);
            },


            close: function () {
                $('#machine-shell-popup').popup('close');
                this._clear();
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
