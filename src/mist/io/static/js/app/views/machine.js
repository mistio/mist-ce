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

            disabledShellClass: function(){
                if(this.machine && this.machine.hasKey){
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('machine.hasKey'),

            disabledTagClass: function(){
                if(this.machine && this.machine.can_tag){
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('machine.can_tag'),

            disabledPowerClass: function(){
                if(this.machine && this.machine.state === 'terminated') {
                    return 'ui-disabled';
                } else {
                    return '';
                }
            }.property('machine.state'),

            pendingMonitoringClass: function() {
                if (this.machine && this.machine.pendingMonitoring) {
                    return 'pending-monitoring';
                } else {
                    return '';
                }
            }.property('machine.pendingMonitoring'),

            metadata: function(){
                if(!this.machine || !this.machine.extra){
                    return [];
                }
                var ret = new Array();

                $.each(this.machine.extra, function(key, value){
                    if (typeof(value) == 'string' || typeof(value) == 'number') {
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

                var basicvars = {
                        'Public IPs': publicIps,
                        'Private IPs': privateIps,
                        'DNS Name': this.machine.extra.dns_name,
                        'Launch Date': this.machine.extra.launchdatetime
                };

                if(this.machine.image && 'image' in this.machine &&
                        'name' in this.machine.image){
                    basicvars['Image'] = this.machine.image.name;
                }

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

            providerIconClass: function() {
                if(!this.machine){
                    return "";
                }
                // TODO: in css this currently works only for ec2 us east
                // other amazon providers have different ids
                return 'provider-' + this.machine.backend.provider;
            }.property("machine"),

            setGraph: function() {

                if(!this.machine || !this.machine.hasMonitoring){
                    return;
                }

                var machine = this.machine;

                var stats = {};

                Em.run.next(function(){
                    var changes_since = 0;

                    function createGraphs() {
                        function stat(x, y, z) {
                          var value = 0,
                              values = [],
                              i = 0,
                              last;
                          return context.metric(function(start, stop, step, callback) {
                            var values = [];
                            
                            // convert start & stop to milliseconds
                            start = +start;
                            stop = +stop;
                                                        
                            var uri = URL_PREFIX + '/backends/' + 
                                    machine.backend.index + '/machines/' + 
                                    machine.id + '/stats' + "?expression=" + x +
                                    "&start=" + start/1000 + "&stop=" + stop/1000 + 
                                    "&step=" + step;
                                    
                            d3.json(uri, function(data) {
                                if (!data) return callback(new Error("unable to load data"));
                                console.warn(data[x][y]);
     
                                callback(null, data[x][y].map(function(d) { return d*100}));
                            });

                        });
                        }
                                                
                        var context = cubism.context()
                            .serverDelay(0)
                            .clientDelay(0)
                            .step(5*1000)
                            .size($(window).width()-180);
                        
                        //var load_avg1 = stat('load','v',0);
                        var cpu_user = stat('cpu','util',0);
                        
                        /*d3.select("#machineGraph").call(function(div) {
                          div.datum(load_avg1);
                        
                          div.append("div")
                              .attr("class", "horizon")
                              .call(context.horizon()
                                .height(30)
                                .colors(["#08519c","#3182bd","#6baed6","#bdd7e7","#bae4b3","#74c476","#31a354","#006d2c"])
                                .title("LOAD ")
                                .extent([0, 1]));
                        
                        });*/
                                
                        $('#machineGraph *').remove();                
                        d3.select("#machineGraph").call(function(div) {
                          div.datum(cpu_user);
                        
                          div.append("div")
                              .attr("class", "horizon")
                              .call(context.horizon()
                                .height(30)
                                .colors(["#08519c","#3182bd","#6baed6","#bdd7e7","#bae4b3","#74c476","#31a354","#006d2c"])
                                .title("CPU ")
                                .extent([0, 100]));
                        
                        });

                        d3.select("#machineGraph").append("g")
                              .call(d3.svg.axis()
                                .scale(d3.time.scale())
                                .orient("bottom"));
                        
                        
                        // On mousemove, reposition the chart values to match the rule.
                        context.on("focus", function(i) {
                          d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
                        });
                    }

                    createGraphs();

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
