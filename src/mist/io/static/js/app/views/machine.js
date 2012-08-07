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
			
		    disabledClass: function(){
		    	if(this.machine && this.machine.hasKey){
			    	return '';
		    	} else {
		    		return 'ui-disabled';
		    	}
		    }.property('machine.hasKey'),
			
			metadata: function(){
				if(!this.machine || !this.machine.extra){
					return [];
				}
				var ret = new Array();
				
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
				
				var ret = new Array();
				
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
			
			upFor: function(){
				if(this.machine && this.machine.uptime){
					var ret = "";
					var x = Math.floor(this.machine.uptime / 1000);
					var seconds = x % 60;
					x = Math.floor(x / 60);
					var minutes = x % 60;
					x = Math.floor(x / 60);
					var hours = x % 24;
					x = Math.floor(x / 24);
					var days = x;
					if(days){
						ret = ret + days + " days, ";
					}
					
					if(hours){
						ret = ret + hours + " hours, ";
					}
					
					if(hours){
						ret = ret + minutes + " minutes, ";
					}
					
					if(seconds){
						ret = ret + seconds + " seconds";
					}
					
					return ret;
				} else {
					return '';
				}
			}.property("machine.uptime"),
			
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
