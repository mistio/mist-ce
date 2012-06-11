define('app/models/size', ['ember'],
	/**
	 * Size model
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
			id: null,
			name: null,
			id: null,
            bandwidth: null,
            disk: null,
            driver: null,
            name: null,
            price: null,
            ram: null,
		});
	}
);