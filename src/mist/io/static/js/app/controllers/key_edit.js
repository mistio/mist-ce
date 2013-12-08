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
            newId: null,
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
                this.set('newId', key.id);
                this.set('key', key);
            },


            close: function() {
                $('#rename-key-popup').popup('close');
                this._clear();
            },


            save: function() {

                if (this.key.id == this.newId) { // Pseudo save
                    this._giveCallback(true);
                    this.close();
                    return;
                }
                if (Mist.keysController.keyExists(this.newId)) {
                    Mist.notificationController.notify('Key name exists already');
                    this._giveCallback(false);
                    return;
                }

                var that = this;
                Mist.keysController.renameKey(this.key.id, this.newId, function(success) {
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
                this.set('newId', null);
                this.set('key', null);
            },


            _giveCallback: function(success) {
                if (this.callback) this.callback(success, this.newId);
            },


            _checkNewId: function() {
                // Remove non alphanumeric chars from key id
                if (this.newId) {
                    this.set('newId', this.newId.replace(/\W/g, ''));
                }
                if (this.newId) {
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

            newIdObserver: function() {
                Ember.run.once(this, '_checkNewId');
            }.observes('newId')
        });
    }
);
