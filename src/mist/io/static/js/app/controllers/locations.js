define('app/controllers/locations', [
    'app/models/location'],
	/**
	 * Locations controller
	 *
	 *
	 * @returns Class
	 */
	function(Location) {
		return Ember.ArrayController.extend({
			backend: null,
			
			init: function() {
				this._super();
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/locations', function(data) {
					var content = [];
					data.forEach(function(item){
						content.push(Location.create(item));
					});
					that.set('content', content);
				}).error(function() {
					Mist.notificationController.notify("Error loading locations for backend: " + that.backend.title);
				});
			}
		});
	}
);