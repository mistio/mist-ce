define('app/views/machines_number_view', [
    'app/models/machine'],
	/**
	 *
	 * @returns Class
	 */
	function(Machine) {
		return Ember.View.extend({
			app: null,
			numberBinding: 'Mist.backendsController.machineCount',
			tagName: 'span',
			classNames: 'ui-li-count',
		    template: Ember.Handlebars.compile('{{number}}'),
		    didInsertElement: function(e){
		    	  $("#home-menu").listview('refresh');
		    },
			
			init: function() {
				this._super();
				this.appendTo('#machines-count');
			}
		});
	}
);