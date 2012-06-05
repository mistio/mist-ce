define('app/models/backend', ['ember'],
	/**
	 * Backend model
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
			id: null,
			title: null,
		    provider: null,
		    interval: null,
		    host: null,
		    status: 'unknown',
		    machines: [],
		    sizes: [],
		    images: [],
		    locations: []
		});
	}
);