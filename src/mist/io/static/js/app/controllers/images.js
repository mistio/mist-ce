define('app/controllers/images', [
    'app/models/image'],
	/**
	 * Images controller
	 *
	 *
	 * @returns Class
	 */
	function(Image) {
		return Ember.ArrayController.extend({
			content: [],
			backend: null,
			
			init: function() {
				this._super();
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/images', function(data) {
					data.forEach(function(item){
						that.pushObject(Image.create(item));
					});
				});
			}
		});
	}
);