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
			image: null,
			name: null,
			backend: null,
			
			reboot: function(){
				console.log('reboot');
				alert("Not implemented");
			},
			
			destroy: function(){
				console.log('destroy');
				alert("Not implemented");
			}
		});
	}
);