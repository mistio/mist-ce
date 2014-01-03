define('app/controllers/key_add', ['ember'],
    /**
     *  Key Add Controller
     *
     *  @returns Class
     */
    function () {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            newKeyId: null,
            callback: null,
            formReady: null,
            uploadingKey: null,
            newKeyPrivate: null,


            /**
             *
             *  Methods
             *
             */

            open: function (callback) {
                $('#create-key-popup').popup('open');
                this._clear();
                this.set('callback', callback);
            },


            close: function () {
                $('#create-key-popup').popup('close');
                this._clear();
            },


            create: function () {

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
                Mist.keysController.createKey(this.newKeyId, this.newKeyPrivate,
                    function (success, newKeyId) {
                        that._giveCallback(success, newKeyId);
                        if (success)
                            that.close();
                    }
                );
            },


            uploadKey: function (file) {

                var that = this;
                var reader = new FileReader();

                reader.onloadend = function (e) {

                    if (e.target.readyState == FileReader.DONE) {
                        that.set('newKeyPrivate', e.target.result);
                    } else {
                        Mist.notificationsController.notify('Failed to upload file');
                    }

                    that.set('uploadingKey', false);
                };

                this.set('uploadingKey', true);
                reader.readAsText(file, 'UTF-8');
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                this.set('callback', null)
                    .set('newKeyId', null)
                    .set('newKeyPrivate', null);
            },


            _giveCallback: function (success, newKeyId) {
                if (this.callback) this.callback(success, newKeyId);
            },


            _updateFormReady: function () {

                if (this.newKeyId) {
                    // Remove non alphanumeric chars from key id
                    this.set('newKeyId', this.newKeyId.replace(/\W/g, ''));
                }
                if (this.newKeyPrivate) {
                    this.set('newKeyPrivate', this.newKeyPrivate.trim());
                }

                this.set('formReady', this.newKeyId && this.newKeyPrivate);
            },


            /**
             *
             *  Observers
             *
             */

            formObserver: function () {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newKeyId', 'newKeyPrivate', 'callback'),
        });
    }
);
