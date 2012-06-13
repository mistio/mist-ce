define('app/models/machine', ['ember'],
	/**
	 * Machine model
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
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