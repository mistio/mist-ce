define('app/controllers/key_add', [
    'ember'
    ],
    /**
     * Machine add controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            newKey: function() {
                warn("new key");
                /*this.get('newMachineBackend').machines.newMachine(
                                            this.get('newMachineName'),
                                            this.get('newMachineImage'),
                                            this.get('newMachineSize'),
                                            this.get('newMachineLocation'));*/
            },

            newKeyClear: function() {
                warn("new key clear");
            },

            updateNewKeyReady: function() {
                
                if (this.get('newKeyName') &&
                    this.get('newKeyPublic') &&
                    this.get('newKeyPrivate')) {
                        this.set('newKeyReady', true);
                } else {
                    this.set('newKeyReady', false);
                }
            },

            init: function() {
                this._super();
                this.addObserver('newKeyName', this, this.updateNewKeyReady);
                this.addObserver('newKeyPublic', this, this.updateNewKeyReady);
                this.addObserver('newKeyPrivate', this, this.updateNewKeyReady);
                this.set('newKeyReady', false);
            }
        });
    }
);
