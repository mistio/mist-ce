define('app/controllers/confirmation', ['ember'],
	/**
	 * Confirmation Dialog controller
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
			show: function(){
				$.mobile.changePage('#dialog-confirm');
			},
			
			confirm: function(){
				this.callback();
				setTimeout(function(){
					$('.ui-dialog').dialog ('close');
				}, 500);
			}
		});
	}
);
