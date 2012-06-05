define('app/models/backend', [
    'app/controllers/machines', 'ember'],
	/**
	 * Backend model
	 *
	 * @returns Class
	 */
	function(MachinesController) {
		return Ember.Object.extend({
			index: null,
			id: null,
			title: null,
		    provider: null,
		    interval: null,
		    host: null,
		    status: 'unknown',
		    machines: MachinesController.create(),
		    sizes: [],
		    images: [],
		    locations: [],
		    
		    init: function() {
				this._super();
				this.listMachines();
			},
			
			listMachines: function(){
				this.machines.refresh(this.index);
			}		
		
		});
	}
);