define('app/models/machine', ['ember'],
	/**
	 * Machine model
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
			STATES: {
				    '0' : 'Running',
				    '1' : 'Rebooting',
				    '2' : 'Terminated',
				    '3' : 'Pending',
				    '4' : 'Unknown'
				    },
			
			id: null,
			
			imageId: null,
			
			image: Ember.computed(function(key, value) {
			    // getter
			    if (arguments.length === 1) {
			    	if(!this.imageId){
						return null;
					}
					var that = this;
					return this.backend.images.getImage(this.imageId, function(image){
						that.set('image', image);
					});
			    // setter
			    } else {
			      return value;
			    }
			  }).property('imageId'), 
				
			name: null,
			backend: null,
			
			reboot: function(){
				console.log('reboot');
				alert("Not implemented");
			},
			
			destroy: function(){
				console.log('destroy');
				alert("Not implemented");
			},

		});
	}
);