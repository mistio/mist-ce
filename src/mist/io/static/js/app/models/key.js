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

            id: null,
            name: null,
            probing: null,
            machines: null,
            selected: null,
            default_key: null,

            updateMachineUptimeChecked: function(machine, timeStamp) {
                this.machines.some(function(machineToUpdate) {
                    if (machineToUpdate[1] == machine.id &&
                        machineToUpdate[0] == machine.backend.id) {
                            machineToUpdate[2] = timeStamp;
                            return true;
                    }
                });
            }
        });
    }
);
