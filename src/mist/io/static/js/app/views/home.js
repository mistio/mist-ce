define('app/views/home', ['app/views/mistscreen','text!app/templates/home.html','ember'],
    /**
     *  Home Page
     *
     *  @returns Class
     */
    function(MistScreen, home_html) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(home_html),

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
