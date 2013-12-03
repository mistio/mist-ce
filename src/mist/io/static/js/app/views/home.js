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
             *  Observers
             * 
             */

            backendsObserver: function() {
                if ($('#backend-buttons').controlgroup) {
                    $('#backend-buttons').controlgroup('refresh');
                }
            }.observes('Mist.backendsController.content.@each'),



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
