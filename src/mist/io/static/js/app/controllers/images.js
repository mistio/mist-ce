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
			backend: null,
			
			init: function() {
				this._super();
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/images', function(data) {
					var content = [];
					data.forEach(function(item){
						content.push(Image.create(item));
					});
					that.set('content', content);
				});
			}
		});
	}
);