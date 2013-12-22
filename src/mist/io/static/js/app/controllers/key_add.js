define('app/controllers/key_add', ['ember'],
    /**
     *  Key Add Controller
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
            uploadingKey: null,

            newKeyId: null,
            newKeyPrivate: null,

            /**
             * 
             *  Methods
             * 
             */

            open: function(callback) {
                $('#create-key-popup').popup('open');
                this._clear();
                this.set('callback', callback);
            },


            close: function() {
                $('#create-key-popup').popup('close');
                this._clear();
            },


            create: function() {

                if (Mist.keysController.keyExists(this.newKeyId)) {
                    Mist.notificationController.notify('Key name exists already');
                    this._giveCallback(false);
                    return;
                }

                // Basic private key validation
                var privateKey = this.newKeyPrivate;
                var beginning = '-----BEGIN RSA PRIVATE KEY-----';
                var ending = '-----END RSA PRIVATE KEY-----';

                if (privateKey.indexOf(beginning) != 0) {
                    Mist.notificationController.notify('Private key should begin with: ' + beginning);
                    this._giveCallback(false);
                    return;
                } else if (privateKey.indexOf(ending) != privateKey.length - ending.length) {
                    Mist.notificationController.notify('Private key should end with: ' + ending);
                    this._giveCallback(false);
                    return;
                }

                var that = this;
                Mist.keysController.createKey(this.newKeyId, this.newKeyPrivate, function(success) {
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
                this.set('newKeyPrivate', null);
            },


            _giveCallback: function(success) {
                if (this.callback) this.callback(success, this.newKeyId);
            },


            _updateFormReady: function() {
                if (this.newKeyId) {
                    // Remove non alphanumeric chars from key id
                    this.set('newKeyId', this.newKeyId.replace(/\W/g, '')); 
                }
                if (this.newKeyPrivate) {
                    this.set('newKeyPrivate', this.newKeyPrivate.trim());
                }

                if (this.newKeyId && this.newKeyPrivate) {
                    this.set('formReady', true);
                } else {
                    this.set('formReady', false);
                }
            },



            /**
             * 
             *  Observers
             * 
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newKeyId', 'newKeyPrivate', 'callback'),
        });
    }
);
