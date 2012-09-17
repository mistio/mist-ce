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
        		var tag = this.tag;

			    this.machine.tags.removeObject(this.tag.toString());
			    
			    var machine = this.machine;
			    
			    log("tag to delete: " + tag);
			    
			    $.ajax({
                    url: 'backends/' + machine.backend.index + '/machines/' + machine.id + '/metadata',
                    type: 'DELETE',
                    data: tag.toString(),
                    success: function(data) {
                        info('Successfully deleted tag from machine', machine.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting tag from machine ' +
                                machine.name);
                        error(textstate, errorThrown, 'while deleting tag from machine machine', machine.name);
        			    machine.tags.addObject(tag.toString());
                    }
                });
        		
            },
            
        });
    }
);