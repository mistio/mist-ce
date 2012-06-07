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
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/machines', function(data) {
					var content = [];
					data.forEach(function(item){
						var machine = Machine.create(item);
						machine.set('backend', that.backend); //maybe bind this property
						content.push(machine);
						
					});
					that.set('content', content);
				});
			}
		});
	}
);