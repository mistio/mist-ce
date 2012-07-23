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
			
			shutdown: function(){
				var machine = this.machine;
				Mist.confirmationController.set("title", 'Shutdown Machine');
				Mist.confirmationController.set("text", 'Are you sure you want to shutdown ' +
						machine.name +' ?');
				Mist.confirmationController.set("callback", function(){
					machine.shutdown();
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
		    
				var publicIps = null;
				
				if($.isArray(this.machine.public_ips)){
					publicIps = this.machine.public_ips.join();
				} else if(typeof this.machine.public_ips === 'string'){
					publicIps = this.machine.public_ips;
				}
				
				var privateIps = null;
				
				if($.isArray(this.machine.private_ips)){
					privateIps = this.machine.private_ips.join();
				} else if(typeof this.machine.private_ips === 'string'){
					privateIps = this.machine.private_ips;
				}
				
				var imageName = null;
				if('image' in this.machine && 'name' in this.machine.image){
					imageName = this.machine.image.name;
				}
				
				var basicvars = {
						'Public IPs': publicIps,
						'Private IPs': privateIps,
						'Image': imageName,
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
			
			providerIconClass: function(){
				if(!this.machine){
					return "";
				}
				
				return 'provider-' + this.machine.backend.provider;
			}.property("machine"),
		    
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(machine_html));
			},
		});
	}
);
