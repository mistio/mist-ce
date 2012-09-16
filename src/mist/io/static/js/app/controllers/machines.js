define('app/controllers/machines', [
    'app/models/machine'],
	/**
	 * Machines controller
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

				if(this.backend.state == "offline"){
					this.clear();
					return;
				}

				var that = this;

				this.backend.set('state', 'wait');

				$.getJSON('/backends/' + this.backend.index + '/machines', function(data) {
					data.forEach(function(item){

						var found = false;

						console.log("item id: " + item.id);

						that.content.forEach(function(machine){

							if(machine.id == item.id){
								found = true;
								machine.set(item); //FIXME this does not change anything;

								machine.set('state', item.state);
								machine.set('can_stop', item.can_stop);
								machine.set('can_start', item.can_start);
								machine.set('can_destroy', item.can_destroy);
								machine.set('can_reboot', item.can_reboot);
								machine.set('tags', item.tags);
								return false;
							}
						});

						if(!found){
							item.backend = that.backend;
							var machine = Machine.create(item);
							that.contentWillChange(that.content.length - 1, 0, 1);
							that.content.push(machine);
							that.contentDidChange(that.content.length - 1, 0, 1);
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

			newMachine: function(name, image, size) {
                console.log('Creating machine', this.name, 'to backend', this.backend.title);

				var payload = {
	                    'name': name,
                        // TODO: this should get a location and not the backend id
	                    'location' : this.backend.id,
	                    'image': image.id,
	                    'size': size.id,
                        // this is needed for Linode only
                        'disk': size.disk
	            };

                var that = this;
				$.ajax({
                    url: 'backends/' + this.backend.index + '/machines',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    dataType: 'json',
                    success: function(data) {
                        console.info('Successfully sent create machine', name, 'to backend',
                                    that.backend.title);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while sending create machine' +
                                name + ' to backend ' + that.backend.title);
                        console.error(textstate, errorThrown, 'while checking key of machine', that.name);
                    }
                });
			}

		});
	}
);
