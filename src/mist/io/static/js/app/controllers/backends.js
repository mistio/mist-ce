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
            status: "wait", // TODO make this property dynamic according to all backends statuses
            
            newMachine: function(){
            	console.log("new machine");
            	this.get('newMachineBackend').machines.newMachine(
            			this.get('newMachineName'),
            			this.get('newMachineImage'),
            			this.get('newMachineSize'));
            },
            
            newMachineClear: function(){
            	this.set('newMachineName', null);
				this.set('newMachineBackend', null);				
				this.set('newMachineImage', null);
				this.set('newMachineSize', null);
				this.set('newMachineCost', null);
				this.set('newMachineReady', false);
            },
            
            updateNewMachineReady: function(){
            	if(this.get('newMachineName') &&
            			this.get('newMachineBackend') &&
            			this.get('newMachineImage') &&
            			this.get('newMachineSize')){
            		this.set('newMachineReady', true);
            	} else {
            		this.set('newMachineReady', false);
            	}
            },
            
			init: function() {
				this._super();

				var that = this;
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
						item.images.addObserver('length', function() {
							var count = 0;
							that.content.forEach(function(item){
								count = count + item.images.get('length');
							});
							that.set('imageCount', count);
						});
						
						item.addObserver('status', function(){
							var waiting = false;
							var state = "ok";
						    
							that.content.forEach(function(backend){
						    	if(backend.status == 'wait'){
						    		waiting = true;
						    	} else if(backend.status == 'offline'){
						    		state = 'error';
						    	} else if(backend.status == 'off'){
						    		state = 'down';
						    	}
						    });
						    
						    if(waiting){
						    	state = 'state-wait-' + state;
						    } else {
						    	state = 'state-' + state;
						    }
						    console.log('setting backends status: ' + state);
						    that.set('status', state);
						});
					});
				}).error(function() {
					Mist.notificationController.notify("Error loading backends");
				});
				
				this.addObserver('newMachineName', this, this.updateNewMachineReady);
				this.addObserver('newMachineBackend', this, this.updateNewMachineReady);				
				this.addObserver('newMachineImage', this, this.updateNewMachineReady);
				this.addObserver('newMachineSize', this, this.updateNewMachineReady);
				this.addObserver('newMachineCost', this, this.updateNewMachineReady);
			}
		});
	}
);
