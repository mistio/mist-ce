define('app/controllers/key_add', [
    'ember'
    ],
    /**
     * Key Add Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            newKeyName: null,
            newKeyReady: null,
            newKeyPrivate: null,

            newKeyObserver: function() {
                if (this.newKeyName && this.newKeyPrivate) {
                    this.set('newKeyReady', true);
                    $('#create-key-ok').removeClass('ui-disabled');
                } else {
                    this.set('newKeyReady', false);
                    $('#create-key-ok').addClass('ui-disabled');
                }
            }.observes('newKeyName', 'newKeyPrivate'),

            newKey: function(machine) {
                Mist.keysController.newKey(this.newKeyName.trim(), this.newKeyPrivate.trim(), machine);
            },

            clear: function() {
                this.set('newKeyName', null);
                this.set('newKeyReady', null);
                this.set('newKeyPrivate', null);
            },

            generateKey: function() {
                $('#action-loader').fadeIn(200);
                $.ajax({
                    url: '/keys',
                    type: 'POST',
                    success: function(data) {
                        $('#action-loader').fadeOut(200);
                        Mist.keyAddController.set('newKeyPrivate', data.priv);
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error generating key: ' + jqXHR.responseText);
                        $('#action-loader').fadeOut(200);
                    }
                });
            }
        });
    }
);
