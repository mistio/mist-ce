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
			
			image: null, 
			name: null,
			backend: null,
			selected: false,
			
			reboot: function(){
				console.log('reboot');
				alert("Not implemented");
			},
			
			destroy: function(){
				console.log('destroy');
				alert("Not implemented");
			},
			
			stateString: function(){
				return this.STATES[this.state].toLowerCase();
			}.property("state"),
			
			init: function(){
				this._super();
				var that = this;
				this.backend.images.getImage(this.imageId, function(image){
					that.set('image', image);
				});
			}

		});
	}
);