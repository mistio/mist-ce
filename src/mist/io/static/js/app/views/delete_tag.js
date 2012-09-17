define('app/views/delete_tag', ['ember'],
    /**
     *
     * Delete tag view
     *
     * @returns Class
     */
    function() {
        
        return Ember.View.extend({
            tagName: false,
            
            didInsertElement: function(e){
            	$("a.tagButton").button();
            },
        
        	deleteTag: function() {
        		this.machine.tags.removeObject(this.tag.toString());
            },
            
        });
    }
);