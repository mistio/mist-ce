define('app/views/home', [
    'app/views/mistscreen',
    'text!app/templates/home.html','ember'],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(MistScreen, home_html) {
        return MistScreen.extend({

            template: Ember.Handlebars.compile(home_html),

            addBackend: function(){
        	$("#add-backend").popup("open");
            }
        
        
        });
    }
);
