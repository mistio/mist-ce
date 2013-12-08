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

            key: null,
            newName: null,
            callback: null,

            /**
             * 
             *  Methods
             * 
             */

            open: function(key, callback) {
                $('#rename-key-popup').popup('open');
                this._clear();
                this.set('callback', callback);
                this.set('newName', key.name);
                this.set('key', key);
            },


            close: function() {
                $('#rename-key-popup').popup('close');
                this._clear();
            },


            save: function() {

                if (this.key.id == this.newName) { // Pseudo save
                    this._giveCallback(true);
                    this.close();
                    return;
                }
                if (Mist.keysController.keyExists(this.newName)) {
                    Mist.notificationController.notify('Key name exists already');
                    this._giveCallback(false);
                    return;
                }

                var that = this;
                Mist.keysController.renameKey(this.key.id, this.newName, function(success) {
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
                this.set('newName', null);
                this.set('key', null);
            },


            _giveCallback: function(success) {
                if (this.callback) this.callback(success, this.newName);
            },


            _checkNewName: function() {
                // Remove non alphanumeric chars from key name
                if (this.newName) {
                    this.set('newName', this.newName.replace(/\W/g, ''));
                }
                if (this.newName) {
                    $('#rename-key-ok').removeClass('ui-state-disabled');
                } else {
                    $('#rename-key-ok').addClass('ui-state-disabled');
                }
            },



            /**
             * 
             *  Observers
             * 
             */

            newNameObserver: function() {
                Ember.run.once(this, '_checkNewName');
            }.observes('newName')
        });
    }
);
