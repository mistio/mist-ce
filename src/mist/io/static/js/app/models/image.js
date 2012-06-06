define('app/models/image', ['ember'],
	/**
	 * Image model
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
			id: null,
			name: null
		});
	}
);