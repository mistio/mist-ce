define('app/controllers/machine_add', ['ember'],
    /**
     * Machine add controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            newMachine: function() {
                console.log("new machine");
                this.get('newMachineBackend').machines.newMachine(
                                            this.get('newMachineName'),
                                            this.get('newMachineImage'),
                                            this.get('newMachineSize'),
                                            this.get('newMachineLocation'));
            },

            newMachineClear: function() {
                this.set('newMachineName', null);
                this.set('newMachineBackend', null);
                this.set('newMachineImage', null);
                this.set('newMachineSize', null);
                this.set('newMachineLocation', null);
                this.set('newMachineCost', 0);
            },

            updateNewMachineReady: function() {
                if (this.get('newMachineName') &&
                    this.get('newMachineBackend') &&
                    this.get('newMachineImage') &&
                    this.get('newMachineSize') &&
                    this.get('newMachineLocation')) {

                        this.set('newMachineReady', true);

                } else {
                    this.set('newMachineReady', false);
                }

                this.set('newMachineNameReady', !!this.get('newMachineName') || !!this.get('newMachineBackend'));
                this.set('newMachineBackendReady', !!this.get('newMachineBackend'));
                this.set('newMachineImageReady', !!this.get('newMachineImage'));
                this.set('newMachineSizeReady', !!this.get('newMachineSize'));
                this.set('newMachineLocationReady', !!this.get('newMachineLocation'));

            },

            init: function() {
                this._super();
                this.addObserver('newMachineName', this, this.updateNewMachineReady);
                this.addObserver('newMachineBackend', this, this.updateNewMachineReady);
                this.addObserver('newMachineImage', this, this.updateNewMachineReady);
                this.addObserver('newMachineSize', this, this.updateNewMachineReady);
                this.addObserver('newMachineLocation', this, this.updateNewMachineReady);
                this.addObserver('newMachineCost', this, this.updateNewMachineReady);
            }
        });
    }
);
