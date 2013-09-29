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

            pub: null,
            priv: null,
            name: null,
            machines: null,
            selected: null,
            default_key: null,
            probing: null,

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
