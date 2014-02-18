define('app/views/home', ['app/views/mistscreen', 'ember'],
    /**
     *  Home View
     *
     *  @returns Class
     */
    function(MistScreen) {
        return MistScreen.extend({

            /**
             * 
             *  Initialization
             * 
             */
            
            load: function() {
                Ember.run.next(function() {
                    document.title = 'mist.io - home';
                });
            }.on('didInsertElement'),


            /**
             * 
             *  Actions
             * 
             */

            actions: {


                addBackend: function() {
                    Mist.backendAddController.open();
                }
            }
        });
    }
);
