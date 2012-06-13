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
			
			init: function() {
				this._super();
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
					var content = [];
					data.forEach(function(item){
						
						//FIXME don't replace content, update the machines instead with
						// machine.set(item);
						
						var machine = Machine.create(item);
						machine.set('backend', that.backend); //maybe bind this property
						content.push(machine);
						
					});
					that.set('content', content);
					Ember.run.later(that, function(){
						this.refresh();
				    }, that.backend.poll_interval);
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