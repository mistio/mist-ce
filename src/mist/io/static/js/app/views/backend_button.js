define('app/views/backend_button', ['ember'],
	/**
	 * Backend button view
	 *
	 * @returns Class
	 */
	function() {
		return Ember.View.extend({
			tagName:false,
            didInsertElement: function(e){
                $("#backend-buttons").trigger('create');
            },
            openDialog: function(event){
                this.get('backend');
            }
	    });
	}
);
