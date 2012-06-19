define('app/views/machine', [
	'text!app/templates/machine.html','ember'],
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
			
			metadata: function(){
				if(!this.machine || !this.machine.extra){
					return [];
				}
				var ret = [];
				
				$.each(this.machine.extra, function(key, value){
					if (typeof(value) == 'string'){
						ret.push({key:key, value: value});
					}
				});
				return ret;
			}.property("machine"),
			
			basicvars: function(){
				if(!this.machine){
					return [];
				}
		    
				var basicvars = {
						'Public IPs': this.machine.public_ips,
						'Private IPs': this.machine.private_ips,
						'Image': this.machine.image,
						'DNS Name': this.machine.extra.dns_name,
						'Launch Date': this.machine.extra.launchdatetime
				};
				
				var ret = [];
				
				$.each(basicvars, function(key, value){
					if (typeof(value) == 'string'){
						ret.push({key:key, value: value});
					}
				});
				
				return ret;
		    
			}.property("machine"),
			
			name: function(){
				if(!this.machine){
					return "";
				}
				return this.machine.name || this.machine.id;
			}.property("machine"),
			
			status: function(){
				if(!this.machine){
					return "";
				}
				
				return this.machine.STATES[this.machine.state].toLowerCase();
			}.property("machine"),
			
			providerIconClass: function(){
				if(!this.machine){
					return "";
				}
				
				return 'provider-' + this.machine.backend.id;
			}.property("machine"),
		    
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(machine_html));
			},
		});
	}
);