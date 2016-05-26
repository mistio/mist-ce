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

            key: null,
            newKeyName: null,
            callback: null,
            formReady: null,


            /**
             *
             *  Methods
             *
             */

            open: function (key, callback) {
                this._clear();
                this.setProperties({
                    key: key,
                    newKeyName: key.name,
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
                    if (Mist.keysController.keyNameExists(this.newKeyName)) {
                        Mist.notificationController.notify('Key name exists: ' + this.newKeyName);
                        this._giveCallback(false);
                        return;
                    }

                    var that = this;
                    Mist.keysController.renameKey(this.key.id, this.newKeyName,
                        function (success, newKeyName) {
                            that._giveCallback(success, newKeyName);
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
                    key: null,
                    newKeyName: null,
                    callback: null,
                });
            },


            _updateFormReady: function () {
                var formReady = false;
                if (this.newKeyName && this.newKeyName != this.key.name) {
                    formReady = true;
                    // Remove non alphanumeric chars from key id
                    this.set('newKeyName', this.newKeyName.replace(/\W/g, ''));

                    if (formReady && Mist.keysController.renamingKey) {
                        formReady = false;
                    }
                }
                this.set('formReady', formReady);
            },


            _giveCallback: function (success, newKeyName) {
                if (this.callback) this.callback(success, newKeyName);
            },


            /**
             *
             *  Observers
             *
             */

            formObserver: function () {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newKeyName')
        });
    }
);
