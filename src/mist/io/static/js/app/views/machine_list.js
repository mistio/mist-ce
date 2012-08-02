define('app/views/machine_list', [
	'text!app/templates/machine_list.html','ember'],
	/**
	 *
	 * Machine page
	 *
	 * @returns Class
	 */
	function(machine_list_html) {
		return Ember.View.extend({
			tagName: false,
			
		    disabledClass: function(){
		    	var machines = new Array();
		    	
		    	if(Mist.backendsController.selectedMachineCount > 1){
		    		return 'ui-disabled';
		    	}
				    
				Mist.backendsController.forEach(function(backend){
					backend.machines.forEach(function(machine){
						if(machine.selected && machine.hasKey){
							machines.push(machine);
						}
					});
				});        
				
		    	if(machines.length == 1){
			    	return '';
		    	} else {
		    		return 'ui-disabled';
		    	}
		    }.property('Mist.backendsController.selectedMachineCount'),
			
		    init: function() {
				this._super();
				this.set('template', Ember.Handlebars.compile(machine_list_html));
			},
		});
	}
);
