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
				
				if(this.backend.status == "offline"){
					this.clear();
					return;
				}
				
				var that = this;
				
				//TODO notify in case of error
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
								console.log("found");
								machine.set(item);
								return false;
							}
						});
						
						if(!found){
							console.log("not found, adding");
							item.backend = that.backend;
							var machine = Machine.create(item);
							that.content.push(machine);
							that.contentDidChange();
						}
						
						//FIXME don't replace content, update the machines instead with
						// machine.set(item);
					})
					
					// TODO handle deletion from server
					
					Ember.run.later(that, function(){
						this.refresh();
				    }, that.backend.poll_interval);
				}).error(function() {
					Mist.notificationController.notify("Error loading machines for backend: " + that.backend.title);
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
                    error: function(jqXHR, textStatus, errorThrown) {
                    }
                });
			}
		
		});
	}
);