define('app/models/backend', [
    'app/controllers/machines',
    'app/controllers/images', 'ember'],
	/**
	 * Backend model
	 *
	 * @returns Class
	 */
	function(MachinesController, ImagesController) {
		return Ember.Object.extend({
			index: null,
			id: null,
			title: null,
		    provider: null,
		    poll_interval: null,
		    host: null,
		    status: 'unknown',
		    machines: null,
		    sizes: [],
		    images: null,
		    locations: [],
		    
		    init: function() {
				this._super();
				this.machines = MachinesController.create({backend: this});
				this.images = ImagesController.create({backend: this});
			},
		
		});
	}
);