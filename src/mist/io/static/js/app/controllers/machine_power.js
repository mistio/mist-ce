define('app/controllers/machine_power', ['ember'],
    /**
     * Machine Power Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend(Ember.Evented, {

            /**
             *  Properties
             */

            machines: [],
            callback: null,

            canStart: null,
            canReboot: null,
            canDestroy: null,
            canShutdown: null,

            /**
             * 
             *  Methods
             * 
             */

            open: function(machines, callback) {
                $('#machine-power-popup').popup('open');
                this._clear();
                this.set('callback', callback);
                this.set('machines', machines instanceof Array ? machines : [machines]);
            },


            close: function() {
                $('#machine-power-popup').popup('close');
                this._clear();
            },


            act: function(action) {

                // Close current popup
                $('#machine-power-popup').popup('close');

                // Set confirmation popup
                var that = this;
                var mPart = this.machines.length > 1 ? ' these machines' : ' this machine';
                Mist.confirmationController.set('title', 'Machine ' + action);
                Mist.confirmationController.set('text', 'Are you sure you want to ' + action + mPart + '?');
                Mist.confirmationController.set('callback', function() {
                    that._act(action);
                });

                // Show confirmation popup
                Ember.run.later(function() {
                    Mist.confirmationController.show();
                }, 500);
            },



            /**
             * 
             *  Pseudo-Private Methods
             * 
             */

            _clear: function() {
                this.set('machines', []);
                this.set('callback', null);
                this.set('canStart', null);
                this.set('canReboot', null);
                this.set('canDestroy', null);
                this.set('canShutdown', null);
            },


            _updateActions: function() {
                Ember.run(this, function() {
                    this.set('canStart', !this.machines.findBy('can_start', false));
                    this.set('canReboot', !this.machines.findBy('can_reboot', false));
                    this.set('canDestroy', !this.machines.findBy('can_destroy', false));
                    this.set('canShutdown', !this.machines.findBy('can_shutdown', false));
                    this.trigger('onActionsChange');
                });
            },


            _giveCallback: function(success, action) {
                if (this.callback) this.callback(success, action);
            },


            _act: function(action) {
                var that = this;
                if (action == 'shutdown') {
                    this.machines.forEach(function(machine) { machine.shutdown(); });
                } else if (action == 'destroy') {
                    this.machines.forEach(function(machine) { machine.destroy(); });
                } else if (action == 'reboot') {
                    this.machines.forEach(function(machine) { machine.reboot(); });
                } else if (action == 'start') {
                    this.machines.forEach(function(machine) { machine.start(); });
                }
            },



            /**
             * 
             *  Observers
             * 
             */

            machinesObserver: function() {
                Ember.run.once(this, '_updateActions');
            }.observes('machines')
        });
    }
);
