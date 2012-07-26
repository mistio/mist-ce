define('app/controllers/backends', [
    'app/models/backend'],
	/**
	 * Backends controller
	 *
	 * @returns Class
	 */
	function(Backend) {
		return Ember.ArrayController.extend({
			content: [],
            machineCount: 0,
            imageCount: 0,
            state: "wait", // TODO make this property dynamic according to all backends states
            
			init: function() {
				this._super();

				var that = this;
				Ember.run.next(function(){
				$.getJSON('/backends', function(data) {
					data.forEach(function(item){
						that.pushObject(Backend.create(item));
					});

					that.content.forEach(function(item){
						item.machines.addObserver('length', function() {
							var count = 0;
							that.content.forEach(function(item){
								count = count + item.machines.get('length');
							});
							that.set('machineCount', count);
						});
						
						item.machines.addObserver('@each.selected', function() {
							var count = 0;
							that.content.forEach(function(item){
								count = count + item.machines.filterProperty('selected', true).get('length');
							});
							that.set('selectedMachineCount', count); 
						    	
						});
						
						item.images.addObserver('length', function() {
							var count = 0;
							that.content.forEach(function(item){
								count = count + item.images.get('length');
							});
							that.set('imageCount', count);
						});
						
						item.addObserver('state', function(){
							var waiting = false;
							var state = "ok";
						    
							that.content.forEach(function(backend){
						    	if(backend.state == 'wait'){
						    		waiting = true;
						    	} else if(backend.state == 'offline'){
						    		state = 'error';
						    	} else if(backend.state == 'off'){
						    		state = 'down';
						    	}
						    });
						    
						    if(waiting){
						    	state = 'state-wait-' + state;
						    } else {
						    	state = 'state-' + state;
						    }
						    console.log('setting backends state: ' + state);
						    that.set('state', state);
						});
					});
				}).error(function() {
					Mist.notificationController.notify("Error loading backends");
				});
				});
			}
		});
	}
);
