define('app/controllers/key_add', [
    'ember'
    ],
    /**
     * Key add controller
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
            },
            
            editKey: function(oldKeyName) {
                log("edit key");
                var newPrivateKey = this.get('newKeyPrivate');
                if (!newPrivateKey){
                    if ($('#textarea-private-key').val().trim() == "") {
                        newPrivateKey = '';
                    } else {
                        newPrivateKey = 'getkeyfromdb'; // Program doesn't seem to get in here any more...
                    }
                }
                //alert(newPrivateKey);
                Mist.keysController.editKey(oldKeyName, this.get('newKeyName'),
                                                        this.get('newKeyPublic'),
                                                        newPrivateKey);
            },

            newKeyClear: function() {
                log("new key clear");
                this.set('newKeyName', null);
                this.set('newKeyPublic', null);
                this.set('newKeyPrivate', null);
            },

            updateNewKeyReady: function() {
                if (this.get('newKeyName') &&
                       (this.get('newKeyPublic') ||
                        this.get('newKeyPrivate'))) {
                    this.set('newKeyReady', true);
                    if('button' in $('#create-key-ok')){
                        $('#create-key-ok').button('enable');
                    }
                } else {
                    this.set('newKeyReady', false);
                    if('button' in $('#create-key-ok')){
                        $('#create-key-ok').button('disable');
                    }
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
