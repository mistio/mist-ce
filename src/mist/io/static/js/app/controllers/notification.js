define('app/controllers/notification', ['ember'],
	/**
	 * Notification controller
	 *
	 * @returns Class
	 */
	function() {
		return Ember.Object.extend({
			
			timeout: false,

			notify: function(message){
				if(this.timeout){
					clearTimeout(this.timeout);
				}
				console.log("notification: " + message);
				jQuery.mobile.showPageLoadingMsg(
						jQuery.mobile.pageLoadErrorMessageTheme,
						message, true);
				this.timeout = setTimeout(jQuery.mobile.hidePageLoadingMsg, 1500);
			}
			
		});
	}
);
