define('app/controllers/key_add', ['ember'],
    /**
     *  Key Add Controller
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            /**
             * 
             *  Properties
             * 
             */

            newKeyName: null,
            newKeyReady: null,
            newKeyPrivate: null,



            /**
             * 
             *  Observers
             * 
             */

            newKeyObserver: function() {
                Ember.run.once(this, function() {
                    if (this.newKeyName && this.newKeyPrivate) {
                        this.set('newKeyReady', true);
                        $('#create-key-ok').removeClass('ui-disabled');
                    } else {
                        this.set('newKeyReady', false);
                        $('#create-key-ok').addClass('ui-disabled');
                    }   
                });
            }.observes('newKeyName', 'newKeyPrivate'),

            newKey: function(machine) {
                Mist.keysController.newKey(this.newKeyName.trim(), this.newKeyPrivate.trim(), machine);
            },

            clear: function() {
                this.set('newKeyName', null);
                this.set('newKeyReady', null);
                this.set('newKeyPrivate', null);
            }
        });
    }
);
