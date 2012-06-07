define('app/views/machine_list', [
    'text!app/views/machine_list_item.html',
	'ember'],
	/**
	 *
	 * Machine List View
	 *
	 * @returns Class
	 */
	function(machine_list_item_html) {
		return Ember.View.extend({
				tagName:false,
	    });
			
	}
);