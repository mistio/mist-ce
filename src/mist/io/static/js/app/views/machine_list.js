define('app/views/machine_list', [
	'text!app/views/machine_list_item.html','ember'],
	/**
	 *
	 * Machine List View
	 *
	 * @returns Class
	 */
	function(machine_list_item_html) {
		return Ember.View.extend({
				tagName:false,
				
				didInsertElement: function(){
			    	
					var that = this;
					
			    	Em.run.next(function() {
			    		
			    		try {
			    			that.get('parentView').$().find("ul").listview('refresh');
			    		} catch(e) {
			    			try {
			    				that.get('parentView').$().find("ul").listview();
				    		} catch(e) {
				    			
				    		}	
			    		}
			    		that.get('parentView').$().find("input[type='checkbox']").checkboxradio();
			        });
			    },
			    
			    checkBoxClick: function(event, el){
			    	if(event.target.tagName != 'A'){
			        	event.stopPropagation();
			        	if(event.target.tagName == 'INPUT'){
			        		var $this = $(event.target);
			        		var checked = $this.is(':checked');
			        		if (checked) {
			        			$this.closest('.node').append('<span class="mist-node-selected" style="display:none">mist-node-selected</span>');
			        		} else {
			        			$this.closest('.node').find('.mist-node-selected').remove();
			        		}
			        		$this.checkboxradio("refresh");
			        		
			        		var len = $('#machines-list input:checked').length; //FIXME don't use IDs
			        	    if (len > 1) {
			        	        $('#machines-footer').fadeIn(140);
			        	        $('#machines #footer-console').addClass('ui-disabled');
			        	    } else if (len > 0) {
			        	        $('#machines-footer').fadeIn(140);
			        	        $('#machines #footer-console').removeClass('ui-disabled');
			        	    } else {
			        	        $('#machines-footer').fadeOut(200);
			        	    }
			        	}
			        } else {
			        	Mist.set('machine', this.machine);
			        }
			    },
			    
			    init: function() {
					this._super();
					// cannot have template in home.pt as pt complains
					this.set('template', Ember.Handlebars.compile(machine_list_item_html));
				},
	    });
			
	}
);