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


            add: function() {
                var that = this;
                this.get('newMachineBackend').machines.newMachine(this.get('newMachineName'),
                                                                  this.get('newMachineImage'),
                                                                  this.get('newMachineSize'),
                                                                  this.get('newMachineLocation'),
                                                                  this.get('newMachineKey'),
                                                                  this.get('newMachineScript'),
                function(success, machine) {
                    that._giveCallback(success, machine);
                    if (success) {
                        that.close();
                    }
                })
            },



            /**
             *
             *  Pseudo-Private Methods
             *
             */

             _clear: function() {
                this.set('callback', null);
                this.set('newMachineName', '');
                this.set('newMachineScript', '');
                this.set('newMachineKey', {'name' : 'Select Key'});
                this.set('newMachineSize', {'name' : 'Select Size'});
                this.set('newMachineImage', {'name' : 'Select Image'});
                this.set('newMachineLocation', {'name' : 'Select Location'});
                this.set('newMachineProvider', {'title' : 'Select Provider'});
             },


            _updateFormReady: function() {
                if (this.newMachineName &&
                    this.newMachineScript &&
                    this.newMachineKey.id &&
                    this.newMachineSize.id &&
                    this.newMachineImage.id &&
                    this.newmachineLocation.id &&
                    this.newMachineProvider.id) {
                        this.set('formReady', true);
                        return;
                } 
                this.set('formReady', false);
            },


            _giveCallback: function(success, machine) {
                if (this.callback) this.callback(success, machine);
            },



            /**
             *
             *  Observers
             *
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newMachineKey',
                       'newMachineName',
                       'newMachineSize',
                       'newMachineImage',
                       'newMachineScript',
                       'newMachineLocation',
                       'newMachineProvider')
        });
    }
);
