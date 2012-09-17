define('app/views/machine_tags_dialog', [
	'text!app/templates/machine_tags_dialog.html','ember'],
	/**
	 *
	 * Machine Tags Dialog page
	 *
	 * @returns Class
	 */
	function(machine_tags_dialog_html) {
		return Ember.View.extend({
			tagName: false,
	
            addTag: function(){
			    var tag = this.tag;
			    log("tag to add: " + tag);
		    },

		    init: function() {
				this._super();
				this.set('template', Ember.Handlebars.compile(machine_tags_dialog_html));
		    }
		});
	}
);
