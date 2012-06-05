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
			content: [],
			backend: null,
			
			init: function() {
				this._super();
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/machines', function(data) {
					data.forEach(function(item){
						that.pushObject(Machine.create(item));
					});
				});
			}
		});
	}
);