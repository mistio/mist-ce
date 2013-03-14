define('app/views/mistscreen', ['ember'],
    /**
     *
     * Mist Base screen page
     *
     * @returns Class
     */
    function() {
        return Ember.View.extend({

            tagName: false,
            
            didInsertElement: function(){
        	try {
        	 $("[data-role=page]").page('destroy').page()
        	} catch(e){}
            },
        
        });
    }
);
