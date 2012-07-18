define('app/views/backend_button', [
	'text!app/templates/backend_button.html','ember'],
	/**
	 * Backend button view
	 *
	 * @returns Class
	 */
	function(backend_button_html) {
		return Ember.View.extend({
			tagName:false,
            didInsertElement: function(e){
                $("#backend-buttons").trigger('create');
            },
            
            openDialog: function(event){
            	Mist.set('backend', this.get('backend'));
            },
            
            init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(backend_button_html));
			},
	    });
	}
);
