define('app/views/home', ['app/views/mistscreen','text!app/templates/home.html','ember'],
    /**
     *  Home Page
     *
     *  @returns Class
     */
    function(MistScreen, home_html) {
        return MistScreen.extend({

            template: Ember.Handlebars.compile(home_html),

            actions: {
                
                addBackend: function() {
                    Mist.backendAddController.clear();
                    $('#add-backend-panel').panel('open');
                }
            }
        });
    }
);
