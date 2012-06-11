define('app/models/backend', [
    'app/controllers/machines',
    'app/controllers/images',
    'app/controllers/sizes',
    'app/controllers/locations', 'ember'],
	/**
	 * Backend model
	 *
	 * @returns Class
	 */
	function(MachinesController, ImagesController,
			SizesController, LocationsController) {
		return Ember.Object.extend({
			
			BACKENDSTATES: ['offline', 'online', 'wait'], //TODO add more states

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
		    
		    isOn: function(){
		    	if(this.status == "offline"){
		    		return false;
		    	} else {
		    		return true;
		    	}
		    },
		    
		    isOff: function(){
		    	return !this.isOn();
		    },
		    
		    init: function() {
				this._super();
				this.machines = MachinesController.create({backend: this});
				this.images = ImagesController.create({backend: this});
				this.sizes = SizesController.create({backend: this});
				this.locations = LocationsController.create({backend: this});
			},
			
			disable: function(){
				this.status = "offline";
				this.machines.clear();
				this.images.clear();
		        this.sizes.clear();
		        this.locations.clear();
			}
		
		});
	}
);