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
					});
				});
			}
		});
	}
);
