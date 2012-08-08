define('app/views/machine', [
	'text!app/templates/machine.html','ember', 'd3', 'cubism'],
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
			
			setGraph: function(){
				var context = cubism.context()
			    .serverDelay(0)
			    .clientDelay(0)
			    .step(1e3)
			    .size(960);
				
				function random(name) {
					  var value = 0,
					      values = [],
					      i = 0,
					      last;
					  return context.metric(function(start, stop, step, callback) {
					    start = +start, stop = +stop;
					    if (isNaN(last)) last = start;
					    while (last < stop) {
					      last += step;
					      value = Math.max(-10, Math.min(10, value + .8 * Math.random() - .4 + .2 * Math.cos(i += .2)));
					      values.push(value);
					    }
					    callback(null, values = values.slice((start - stop) / step));
					  }, name);
					}

					

					var foo = random("foo"),
					    bar = random("bar");

					d3.select("#machineGraph").call(function(div) {

					  div.append("div")
					      .attr("class", "axis")
					      .call(context.axis().orient("top"));

					  div.selectAll(".horizon")
					      .data([foo, bar, foo.add(bar), foo.subtract(bar)])
					    .enter().append("div")
					      .attr("class", "horizon")
					      .call(context.horizon().extent([-20, 20]));

					  div.append("div")
					      .attr("class", "rule")
					      .call(context.rule());

					});
					// On mousemove, reposition the chart values to match the rule.
					context.on("focus", function(i) {
					  d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
					});
			}.observes('machine'),
		    
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(machine_html));
			},
		});
	}
);
