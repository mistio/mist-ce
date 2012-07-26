define('app/views/shell', [
	'text!app/templates/shell.html','ember'],
	/**
	 *
	 * Shell dialog
	 *
	 * @returns Class
	 */
	function(shell_html) {
		return Ember.View.extend({
			tagName: false,
			machineBinding: 'Mist.machine',

			shell: function(){
            	alert('shell view');
                //machine.shell();
			},

		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(shell_html));
			},
		});
	}
);
