define('app/views/machine_list', [
	'text!app/templates/machine_list_item.html','ember'],
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
			        });
			    },
			    
			    checkBoxClick: function(event, el){
			    	
			    	console.log('machine clicked');
			    	Mist.set('machine', this.machine);
			    },
			    
			    machineSelected: function(){
			    	console.log('selected changed');

			    	var that = this;
			    	
			    	Em.run.next(function() {
			    		try { 
			    			that.get('parentView').$().find("input[type='checkbox']").checkboxradio('refresh');
			    		} catch (e) {
			    			that.get('parentView').$().find("input[type='checkbox']").checkboxradio();
			    		}
			    		
		        		var len = $('#machines-list input:checked').length; //FIXME use data instead of DOM
		        	    if (len > 1) {
		        	        $('#machines-footer').fadeIn(140);
		        	        $('#machines #footer-console').addClass('ui-disabled');
		        	    } else if (len > 0) {
		        	        $('#machines-footer').fadeIn(140);
		        	        $('#machines #footer-console').removeClass('ui-disabled');
		        	    } else {
		        	        $('#machines-footer').fadeOut(200);
		        	    }
			    	});
			    	
			    }.observes('machine.selected'),
			    
			    init: function() {
					this._super();
					// cannot have template in home.pt as pt complains
					this.set('template', Ember.Handlebars.compile(machine_list_item_html));
				},
	    });
			
	}
);