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
					
					if(minutes){
						ret = ret + minutes + " minutes, ";
					}
					
					if(seconds){
						ret = ret + seconds + " seconds";
					} else {
						ret = ret + "0 seconds";
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
				
				if(!this.machine || !this.machine.hasMonitoring){
					return;
				}
				
				var machine = this.machine;
				 
				var stats = {};
				
				Em.run.next(function(){
					var context = cubism.context()
						.serverDelay(0)
						.clientDelay(0)
						.step(5000)
						.size(960);
				
					var changes_since = 0;
				
					function poll(){
						if(!Mist.graphPolling){
							return;
						}
					
						data = {};
						if(changes_since){
							data.changes_since = changes_since;
						}
					
					changes_since = Date.now();
					
					$.ajax({
						url: '/backends/' + machine.backend.index + '/machines/' + machine.id + '/stats',
						data: data,
						success: function(data) {
							console.log("machine stats");
							console.log(data);
							stats = data;
							setTimeout(poll, 5000);
						}
					}).error(function(jqXHR, textStatus, errorThrown) {
						console.log('error querying for machine stats for machine id: ' + machine.id);
						console.log(textStatus + " " + errorThrown);
						setTimeout(poll, 5000);
					});
				}
				
				function draw(name) {
					  var value = 0,
					      values = [],
					      i = 0,
					      last;
					  
					  return context.metric(function(start, stop, step, callback) {
					    start = +start, stop = +stop;
					    if (isNaN(last)) last = start;
					    while (last < stop) {
					      last += step;
					      value = stats[name];
					      values.push(value);
					    }
					    callback(null, values = values.slice((start - stop) / step));
					  }, name);
					}

					

					var cpu = draw("cpu"),
					    memory = draw("memory"),
					    disk = draw("disk"),
					    load = draw("load");

					d3.select("#machineGraph").call(function(div) {

					  div.append("div")
					      .attr("class", "axis")
					      .call(context.axis().orient("top"));

					  div.selectAll(".horizon")
					      .data([cpu, memory, disk, load])
					    .enter().append("div")
					      .attr("class", "horizon")
					      .call(context.horizon().extent([-200, 200]));

					  div.append("div")
					      .attr("class", "rule")
					      .call(context.rule());

					});
					// On mousemove, reposition the chart values to match the rule.
					context.on("focus", function(i) {
					  d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
					});
					
					poll();
					
				});
				
			}.observes('machine.hasMonitoring'),
		    
		    init: function() {
				this._super();
				// cannot have template in home.pt as pt complains
				this.set('template', Ember.Handlebars.compile(machine_html));
			},
		});
	}
);
