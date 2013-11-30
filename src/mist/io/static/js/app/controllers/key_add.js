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
            newKeyCallback: null,

            /**
             * 
             *  Observers
             * 
             */

            newKeyObserver: function() {

                // Remove whitespaces from name and key
                if (this.newKeyName) {
                    this.set('newKeyName', this.newKeyName.replace(/ /g, ''));
                }
                if (this.newKeyPrivate) {
                    this.set('newKeyPrivate', this.newKeyPrivate.trim());
                }

                // Check if key is ready
                if (this.newKeyName && this.newKeyPrivate) {
                    this.set('newKeyReady', true);
                    $('#create-key-ok').removeClass('ui-state-disabled');
                } else {
                    this.set('newKeyReady', false);
                    $('#create-key-ok').addClass('ui-state-disabled');
                }
            }.observes('newKeyName', 'newKeyPrivate'),



            /**
             * 
             *  Methods
             * 
             */

            create: function() {

                // Check if key name exist already
                if (Mist.keysController.keyNameExists(this.newKeyName)) {
                    Mist.notificationController.notify('Key name exists already');
                    return;
                }

                // Basic private key validation
                var privateKey = this.newKeyPrivate;
                var beginning = '-----BEGIN RSA PRIVATE KEY-----';
                var ending = '-----END RSA PRIVATE KEY-----';

                if (privateKey.indexOf(beginning) != 0) {
                    Mist.notificationController.notify('Private key should begin with: ' + beginning);
                    return;
                } else if (privateKey.indexOf(ending) != privateKey.length - ending.length) {
                    Mist.notificationController.notify('Private key should end with: ' + ending);
                    return;
                }

                // Create key
                Mist.keysController.createKey(this.newKeyName,
                                              this.newKeyPrivate,
                                              this.newKeyCallback);
            },


            clear: function() {
                this.set('newKeyName', null);
                this.set('newKeyReady', null);
                this.set('newKeyPrivate', null);
                this.set('newKeyCallback', null);
                this.newKeyObserver();
            }
        });
    }
);
