define('app/views/edit_backend', [
	'text!app/views/edit_backend_dialog.html',
	'ember'],
	/**
	 *
	 * Edit Backend Dialog
	 *
	 * @returns Class
	 */
	function(edit_backend_dialog_html) {
		return Ember.View.extend({
			
			tagName:false,
			
		    //TODO add event handlers for each element on the dialog
		    
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(edit_backend_dialog_html));
			},
		});
	}
);