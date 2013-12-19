define('app/controllers/machine_add', ['ember'],
    /**
     *  Machine Add Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({
            
            /**
             *  Properties
             */

            callback: null,
            formReady: null,
            newMachineCost: null,

            newMachineKey: null,
            newMachineName: null,
            newMachineSize: null,
            newMachineImage: null,
            newMachineScript: null,
            newMachineLocation: null,
            newMachineProvider: null,

            /**
             *
             *  Methods
             *
             */

            open: function(callback) {
                this._clear();
                $('#create-machine-panel').panel('open');
                this.set('callback', callback);
            },


            close: function() {
                $('#create-machine-panel').panel('close');
                this._clear();
            },



            /**
             *
             *  Pseudo-Private Methods
             *
             */

             _clear: function() {
                this.set('newMachineName', '');
                this.set('newMachineScript', '');
                this.set('newMachineKey', {'name' : 'Select Key'});
                this.set('newMachineSize', {'name' : 'Select Size'});
                this.set('newMachineImage', {'name' : 'Select Image'});
                this.set('newMachineLocation', {'name' : 'Select Location'});
                this.set('newMachineProvider', {'title' : 'Select Provider'});
             },

            newMachine: function() {
                log("new machine");
                this.get('newMachineBackend').machines.newMachine(
                                            this.get('newMachineName'),
                                            this.get('newMachineImage'),
                                            this.get('newMachineSize'),
                                            this.get('newMachineLocation'),
                                            this.get('newMachineKey'),
                                            this.get('newMachineScript'),
                                            this.get('newMachineCost'));
            },

            newMachineClear: function() {

            },

            updateNewMachineReady: function() {
                if (this.get('newMachineName') &&
                    this.get('newMachineBackend') &&
                    this.get('newMachineImage') &&
                    this.get('newMachineSize') &&
                    this.get('newMachineKey') &&
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
                this.set('newMachineKeyReady', !!this.get('newMachineKey'));
                this.set('newMachineScriptReady', !!this.get('newMachineScript'));
            }
        });
    }
);
