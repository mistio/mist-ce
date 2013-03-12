define('app/views/home', [
    'app/views/jqm_page',
    'text!app/templates/home.html','ember'],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(Page, home_html) {
        return Page.extend({

            id: 'home',

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(home_html));
            },
            
            addBackend: function(){
        	$("#add-backend").popup("open");
            }
        });
    }
);
