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
            
            whatCanIPossiblyDoChrome: function() {
                // Desperate
                Ember.run.later(function() {
                    // ...
                    $('#backend-buttons').css('display', 'inline-block');
                    Ember.run.next(function() {
                        // At this point, I want to mention that the 
                        // display attribute was set to block beforehand
                        $('#backend-buttons').css('display', 'block');
                    });
                }, 100);
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
