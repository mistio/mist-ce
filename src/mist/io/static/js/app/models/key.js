define('app/models/key', [
    'ember'
    ],
    /**
     * Key model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({



            /**
             * 
             *  Properties
             * 
             */

            id: null,
            name: null,
            probing: null,
            machines: null,
            selected: null,
            default_key: null,
            


            /**
             * 
             *  Methods
             * 
             */
            
            destroy: function() {
                var that = this;
                Mist.confirmationController.set('title', 'Delete key');
                Mist.confirmationController.set('text', 'Are you sure you want to delete "' + this.name + '" ?');
                Mist.confirmationController.set('callback', function() {
                    Mist.Router.router.transitionTo('keys');
                    Mist.keysController.deleteKey(that.name);
                });
                Mist.confirmationController.show();
            },

            updateMachineUptimeChecked: function(machine, timeStamp) {
                this.machines.some(function(machineToUpdate) {
                    if (machineToUpdate[1] == machine.id &&
                        machineToUpdate[0] == machine.backend.id) {
                            machineToUpdate[2] = timeStamp;
                            return true;
                    }
                });
            },

            updateMachineList: function(keyName, data) {
                this.content.some(function(key) {
                    if (key.name == keyName) {
                        key.set('machines', data ? data : []);
                        return true;
                    }
                });
            },
        });
    }
);
