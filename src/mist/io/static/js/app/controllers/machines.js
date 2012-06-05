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
			
			refresh: function(index) {
				var that = this;
				$.getJSON('/backends/' + index + '/machines', function(data) {
					data.forEach(function(item){
						that.pushObject(Machine.create(item));
					});
				});
			}
		});
	}
);