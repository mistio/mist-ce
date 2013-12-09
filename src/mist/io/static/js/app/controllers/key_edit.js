define('app/controllers/key_edit', ['ember'],
    /**
     *  Key Edit Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            callback: null,
            formReady: false,

            keyId: null,
            newKeyId: null,

            /**
             * 
             *  Methods
             * 
             */

            open: function(keyId, callback) {
                $('#rename-key-popup').popup('open');
                this._clear();
                this.set('callback', callback);
                this.set('newKeyId', keyId);
                this.set('keyId', keyId);
            },


            close: function() {
                $('#rename-key-popup').popup('close');
                this._clear();
            },


            save: function() {

                if (this.keyId == this.newKeyId) { // Pseudo save
                    this._giveCallback(true);
                    this.close();
                    return;
                }
                if (Mist.keysController.keyExists(this.newKeyId)) {
                    Mist.notificationController.notify('Key name exists already');
                    this._giveCallback(false);
                    return;
                }

                var that = this;
                Mist.keysController.renameKey(this.keyId, this.newKeyId, function(success) {
                    that._giveCallback(success);
                    if (success) {
                        that.close();
                    }
                });
            },



            /**
             * 
             *  Pseudo-Private Methods
             * 
             */

            _clear: function() {
                this.set('callback', null);
                this.set('newKeyId', null);
                this.set('keyId', null);
            },


            _updateFormReady: function() {
                if (this.newKeyId) {
                    // Remove non alphanumeric chars from key id
                    this.set('newKeyId', this.newKeyId.replace(/\W/g, ''));
                }
                this.set('formReady', !!this.newKeyId);
            },


            _giveCallback: function(success) {
                if (this.callback) this.callback(success, this.newKeyId);
            },



            /**
             * 
             *  Observers
             * 
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newKeyId')
        });
    }
);
