define('app/controllers/machines', [
    'app/models/machine'],
	/**
	 * Machines controller
	 *
	 * FIXME perhaps have a reference to the holding backend?
	 *
	 * @returns Class
	 */
	function(Machine) {
		return Ember.ArrayController.extend({
			backend: null,
			
			content: null,
			
			init: function() {
				this._super();
				this.set('content', []),
				this.refresh();
			},
			
			refresh: function(){
				console.log("refreshing machines");
				
				if(this.backend.state == "offline"){
					this.clear();
					return;
				}
				
				var that = this;
				
				this.backend.set('state', 'wait');
				
				$.getJSON('/backends/' + this.backend.index + '/machines', function(data) {
					
					console.log("machines for " + that.backend.title);
					console.log(data.length);
					
					data.forEach(function(item){
						
						var found = false;
						
						console.log("item id: " + item.id);
						
						that.content.forEach(function(machine){
							console.log("machine id: " + machine.id);
							
							if(machine.id == item.id){
								found = true;
								machine.set(item); //FIXME this does not change anything;
								
								machine.set('state', item.state);
								machine.set('can_stop', item.can_stop);
								machine.set('can_start', item.can_start);
								machine.set('can_destroy', item.can_destroy);
								machine.set('can_reboot', item.can_reboot);
								return false;
							}
						});
						
						if(!found){
							console.log("not found, adding");
							item.backend = that.backend;
							var machine = Machine.create(item);
							that.contentWillChange();
							that.content.push(machine);
							that.contentDidChange();
							Mist.backendsController.contentWillChange();
							Mist.backendsController.contentDidChange();
						}
						
						
					});
					
					that.content.forEach(function(item){
						
						var found = false;
						
						data.forEach(function(machine){
							console.log("machine id: " + machine.id);
							
							if(machine.id == item.id){
								found = true;
								return false;
							}
						});
						
						if(!found){
							console.log("not found, deleting");
							that.contentWillChange();
							that.removeObject(item);
							that.contentDidChange();
							Mist.backendsController.contentWillChange();
							Mist.backendsController.contentDidChange();
						}
					});
					
					// TODO handle deletion from server
					
					that.backend.set('state', 'online');
					
					Ember.run.later(that, function(){
						this.refresh();
				    }, that.backend.poll_interval);
				}).error(function(e) {
					Mist.notificationController.notify("Error loading machines for backend: " + that.backend.title);
					that.backend.set('state', 'offline');
					console.log("Error loading machines for backend: " + that.backend.title);
					console.log(e.state + " " + e.stateText);
				});
				
			},
			
			newMachine: function(name, image, size){
				var payload = {
	                    "name": name,
	                    "location" : this.backend.id,
	                    "image": image.id,
	                    "size": size.id
	            };
				$.ajax({
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(payload),
                    url: 'backends/' + this.backend.index + '/machines',
                    success: function(data) {
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                    }
                });
			}
		
		});
	}
);