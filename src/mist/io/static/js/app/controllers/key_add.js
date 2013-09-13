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

            newKeyName: null,    // str
            newKeyPublic: null,  // str
            newKeyPrivate: null, // str
            newKeyReady: null,   // bool

            init: function() {
                this._super();
            },

            newKeyReadyObserver: function() {
                if (this.newKeyName && this.newKeyPrivate) {
                    this.set('newKeyReady', true);
                    $('#create-key-ok').button('enable');
                } else {
                    this.set('newKeyReady', false);
                    $('#create-key-ok').button('disable');
                }
            }.observes('newKeyName', 'newKeyPrivate'),

            newKey: function() {
                Mist.keysController.newKey(this.get('newKeyName'),
                                            this.get('newKeyPublic'),
                                            this.get('newKeyPrivate'));
            },

            editKey: function(oldKeyName) {
                Mist.keysController.editKey(oldKeyName,
                                             this.get('newKeyName'),
                                             this.get('newKeyPublic'),
                                             this.get('newKeyPrivate'));
            },

            newKeyClear: function() {
                this.set('newKeyName', null);
                this.set('newKeyPublic', null);
                this.set('newKeyPrivate', null);
                $('#create-key-ok').button('disable');
            },
            
            generateKey: function() {
                $('#dialog-add-key .ajax-loader').fadeIn(200);
                var that = this;
                $.ajax({
                    url: '/key_generate',
                    type: 'GET',
                    success: function(result) {
                        $('#dialog-add-key .ajax-loader').fadeOut(200);
                        info('Successfully generated key');
                        that.set('newKeyPublic', result.public);
                        that.set('newKeyPrivate', result.private);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.notificationController.notify('Error while generating key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while generating key');
                    }
                });
            }
        });
    }
);
