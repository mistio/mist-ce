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
			hasKey: false,
			
			reboot: function(){
				console.log('reboot');
				
				var that = this;
				
				$.ajax({
                    url: '/backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    data: {action: 'reboot',},
                    success: function(data) {
                    	console.log("machine rebooting");
                    }
				
				}).error(function(e) {
					Mist.notificationController.notify("Error rebooting machine: " + that.name);
					console.error("Error rebooting machine: " + that.name);
					console.error(e.status + " " + e.statusText);
				});
			},
			
			destroy: function(){
				console.log('destroy');
				$.ajax({
                    url: '/backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    data: {action: 'destroy',},
                    success: function(data) {
                    	console.log("machine being destroyed");
                    }
				
				}).error(function(e) {
					Mist.notificationController.notify("Error destroying machine: " + that.name);
					console.error("Error destroying machine: " + that.name);
					console.error(e.status + " " + e.statusText);
				});
			},
			
			shutdown: function(){
				console.log('shutdown');
				$.ajax({
                    url: '/backends/' + this.backend.id + '/machines/' + this.id,
                    type: 'POST',
                    data: {action: 'shutdown',},
                    success: function(data) {
                    	console.log("machine shutting down");
                    }
				
				}).error(function(e) {
					Mist.notificationController.notify("Error shutting down machine: " + that.name);
					console.error("Error shutting down machine: " + that.name);
					console.error(e.status + " " + e.statusText);
				});
			},
			
			stateString: function(){
				return this.STATES[this.state].toLowerCase();
			}.property("state"),
			
			hasAlert : function(){
				//TODO when we have alerts
				return false;
			},
			
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