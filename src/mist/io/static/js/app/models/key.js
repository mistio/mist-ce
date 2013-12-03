define('app/models/key', ['ember'],
    /**
     *  Key model
     *
     *  @returns Class
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
