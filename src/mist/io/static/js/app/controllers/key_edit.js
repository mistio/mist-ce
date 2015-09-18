define('app/controllers/key_edit', ['ember'],
    /**
     *  Key Edit Controller
     *
     *  @returns Class
     */
    function () {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            keyId: null,
            newKeyId: null,
            callback: null,
            formReady: null,


            /**
             *
             *  Methods
             *
             */

            open: function (keyId, callback) {
                this._clear();
                this.setProperties({
                    keyId: keyId,
                    newKeyId: keyId,
                    callback: callback,
                });
                this._updateFormReady();

                this.view.open();
            },


            close: function () {
                this.view.close();
                this._clear();
            },


            save: function () {
                if (this.formReady) {
                    if (Mist.keysController.keyExists(this.newKeyId)) {
                        Mist.notificationController.notify('Key name exists already');
                        this._giveCallback(false);
                        return;
                    }

                    var that = this;
                    Mist.keysController.renameKey(this.keyId, this.newKeyId,
                        function (success, newKeyId) {
                            that._giveCallback(success, newKeyId);
                            if (success)
                                that.close();
                        });
                }
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _clear: function () {
                this.setProperties({
                    keyId: null,
                    newKeyId: null,
                    callback: null,
                });
            },


            _updateFormReady: function () {
                var formReady = false;
                if (this.newKeyId && this.newKeyId != this.keyId) {
                    formReady = true;
                    // Remove non alphanumeric chars from key id
                    this.set('newKeyId', this.newKeyId.replace(/\W/g, ''));

                    if (formReady && Mist.keysController.renamingKey) {
                        formReady = false;
                    }
                }
                this.set('formReady', formReady);
            },


            _giveCallback: function (success, newKeyId) {
                if (this.callback) this.callback(success, newKeyId);
            },


            /**
             *
             *  Observers
             *
             */

            formObserver: function () {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newKeyId')
        });
    }
);
