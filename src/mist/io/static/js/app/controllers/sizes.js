define('app/controllers/sizes', [
    'app/models/size'],
	/**
	 * Sizes controller
	 *
	 *
	 * @returns Class
	 */
	function(Size) {
		return Ember.ArrayController.extend({
			backend: null,
			
			init: function() {
				this._super();
			
				var that = this;
				$.getJSON('/backends/' + this.backend.index + '/sizes', function(data) {
					var content = new Array();
					data.forEach(function(item){
						content.push(Size.create(item));
					});
					that.set('content', content);
				});
			}
		});
	}
);