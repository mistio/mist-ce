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
				var machine = this.machine;
				if(!machine){
					Mist.backendsController.forEach(function(backend){
						backend.machines.forEach(function(m){
							if(m.selected && m.hasKey){
								console.log('machine selected');
								machine = m;
							}
						});
					}); 
				}
				this.set('machine', machine);
				this.machine.shell(this.command);
				this.clear();
			},
			
			clear: function(){
				this.set('command', '');
			},
			
			disabledClass: function(){
				if(this.command && this.command.length > 0){
					return '';
				} else {
					return 'ui-disabled';
				}
			}.property('command'),

		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(shell_html));
			},
		});
	}
);
