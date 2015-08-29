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
            formReady: false,


            /**
             *
             *  Methods
             *
             */

            open: function (keyId, callback) {
                console.log(this.view.popupId);
                this._clear();
                this.setProperties({
                    keyId: keyId,
                    newKeyId: keyId,
                    callback: callback,
                });

                this.view.open();
            },


            close: function () {
                this.view.close();
                this._clear();
            },


            save: function () {
                // If new id is same as old id,
                // act as if it is saved
                if (this.keyId == this.newKeyId) {
                    this._giveCallback(true, this.newKeyId);
                    this.close();
                    return;
                }

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
                if (this.newKeyId) {
                    // Remove non alphanumeric chars from key id
                    this.set('newKeyId', this.newKeyId.replace(/\W/g, ''));
                }
                this.set('formReady', !! this.newKeyId);
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
