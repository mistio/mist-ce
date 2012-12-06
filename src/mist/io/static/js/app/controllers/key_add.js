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
                log("new key");
                Mist.keysController.newKey(this.get('newKeyName'),
                                            this.get('newKeyPublic'),
                                            this.get('newKeyPrivate'));
                Ember.run.next(function(){$('#keys-list').listview('refresh')});
            },

            newKeyClear: function() {
                log("new key clear");
                this.set('newKeyName', null);
                this.set('newKeyPublic', null);
                this.set('newKeyPrivate', null);
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
