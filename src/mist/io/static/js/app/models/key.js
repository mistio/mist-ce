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
            probeState: 'unprobed',
            
            updateProbeState: function(machine, timeStamp) {
                for (var m = 0; m < this.machines.length; ++m) {
                    if (this.machines[m][1] == machine.id && 
                        this.machines[m][0] == machine.backend.id) {
                            this.machines[m][2] = timeStamp;
                            if (timeStamp > 0) {
                                this.set('probeState', 'probed');
                                Mist.backendsController.getMachineById(this.machines[m][0],
                                                                       this.machines[m][1]).set('probed', true);
                            } else {
                                this.set('probeState', 'unprobed');
                            }
                            return;
                    }
                }
            }
        });
    }
);
