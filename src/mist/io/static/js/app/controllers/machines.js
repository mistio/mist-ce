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
						var machine = Machine.create(item);
						machine.set('backend', that.backend); //maybe bind this property
						content.push(machine);
						
					});
					that.set('content', content);
					Ember.run.later(that, function(){
						this.refresh();
				    }, that.backend.poll_interval);
				});
				
			}
		
		});
	}
);