define('app/views/home', ['app/views/mistscreen','text!app/templates/home.html','ember'],
    /**
     *  Home Page
     *
     *  @returns Class
     */
    function(MistScreen, home_html) {
        return MistScreen.extend({

            /**
             * 
             *  Properties
             * 
             */

            template: Ember.Handlebars.compile(home_html),

            /**
             * 
             *  Initialization
             * 
             */
            
            whatCanIPossiblyDoChrome: function() {
                Ember.run.later(function() {
                    $('#backend-buttons').css('display', 'inline-block');
                }, 100);
            }.on('didInsertElement'),

            /**
             * 
             *  Actions
             * 
             */

            actions: {

                addBackend: function() {
                    Mist.backendAddController.clear();
                    Mist.backendAddController.set('newBackendCallback', function() {
                        $('#add-backend-panel').panel('close');
                        Mist.backendAddController.clear();
                    });
                    $('#add-backend-panel').panel('open');
                }
            }
        });
    }
);
