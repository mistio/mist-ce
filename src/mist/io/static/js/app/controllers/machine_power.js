define('app/controllers/machine_power', ['ember'],
    /**
     * Machine Power Controller
     *
     * @returns Class
     */
    function () {
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

            open: function (machines, callback) {
                this._clear();
                this.set('callback', callback);
                this.set('machines', machines instanceof Array ? machines : [machines]);
                Ember.run.next(function () {
                    $('#machine-power-popup').popup('open');
                });
            },


            close: function () {
                $('#machine-power-popup').popup('close');
                this._clear();
            },


            act: function (action) {

                // Close current popup
                $('#machine-power-popup').popup('close');

                var machineNames = this.machines.toStringByProperty('name');

                var that = this;
                Ember.run.later(function () {
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Machine action',
                        body: [
                            {
                                paragraph: 'Are you sure you want to ' + action + ' these machines: ' +
                                    machineNames + ' ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                that._act(action);
                            }
                        }
                    });
                }, 500);
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                Ember.run(this, function () {
                    this.set('machines', []);
                    this.set('callback', null);
                    this.set('canStart', null);
                    this.set('canReboot', null);
                    this.set('canDestroy', null);
                    this.set('canShutdown', null);
                });
            },


            _updateActions: function () {
                Ember.run(this, function () {
                    this.set('canStart', !this.machines.findBy('can_start', false));
                    this.set('canReboot', !this.machines.findBy('can_reboot', false));
                    this.set('canDestroy', !this.machines.findBy('can_destroy', false));
                    this.set('canShutdown', !this.machines.findBy('can_stop', false));
                    this.trigger('onActionsChange');
                });
            },


            _giveCallback: function (success, action) {
                if (this.callback) this.callback(success, action);
            },


            _act: function (action) {
                this.machines.forEach(function (machine) {
                    if (action == 'shutdown') {
                        machine.shutdown();
                    } else if (action == 'destroy') {
                        machine.destroy();
                    } else if (action == 'reboot') {
                        machine.reboot();
                    } else if (action == 'start') {
                        machine.start();
                    }
                });
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
