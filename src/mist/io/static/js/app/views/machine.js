define('app/views/machine', [
	'text!app/views/machine.html','ember'],
	/**
	 *
	 * Machine page
	 *
	 * @returns Class
	 */
	function(machine_html) {
		return Ember.View.extend({
			tagName: false,
			machineBinding: 'Mist.machine',
			
			reboot: function(){
				var machine = this.machine;
				Mist.confirmationController.set("title", 'Reboot Machine');
				Mist.confirmationController.set("text", 'Are you sure you want to reboot ' +
						machine.name +' ?');
				Mist.confirmationController.set("callback", function(){
					machine.reboot();
				});
				Mist.confirmationController.show();
			},
			
			destroy: function(){
				var machine = this.machine;
				Mist.confirmationController.set("title", 'Destroy Machine');
				Mist.confirmationController.set("text", 'Are you sure you want to destroy ' +
						machine.name +' ?');
				Mist.confirmationController.set("callback", function(){
					machine.destroy();
				});
				Mist.confirmationController.show();
			},
			
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(machine_html));
			},
		});
	}
);