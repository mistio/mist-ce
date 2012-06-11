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
			attributeBindings:['data-role', 'data-theme'],
			
			'data-role': 'content',
			'data-theme': 'c',
			
		    //TODO add event handlers for each element on the dialog
			
			deleteButtonClick: function(){
				$('#backend-delete-confirm').slideDown();
			},
			
			deleteCancelButtonClick: function(){
				$('#backend-delete-confirm').slideUp();
			},
			
			deleteConfirmButtonClick: function(){
				Mist.backendsController.removeObject(this.backend);
				history.back();
				$('#backend-delete-confirm').hide();
				// refresh backend buttons
			},
		    
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(edit_backend_dialog_html));
			},
		});
	}
);