define('app/views/image_list', [
	'text!app/templates/image_list.html','ember'],
	/**
	 *
	 * Machine page
	 *
	 * @returns Class
	 */
	function(image_list_html) {
		return Ember.View.extend({
			tagName: false,
			
		    init: function() {
				this._super();
				this.set('template', Ember.Handlebars.compile(image_list_html));
			},
		});
	}
);
