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
				if(this.get('fromDialog')){
					window.history.go(-2);
				} else {
					window.history.go(-1);
				}
				this.set("callback", function(){});
			}
		});
	}
);
