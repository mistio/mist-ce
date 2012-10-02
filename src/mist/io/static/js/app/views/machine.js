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
                    function createGraph(type) {
                        var n = 1000,
                            duration = 500,
                            now = new Date(Date.now() - duration),
                            count = 0,
                            graphdata = d3.range(n).map(function() { return 0; });
                                               
                        var margin = {top: 0, right: 0, bottom: 20, left: 0},
                            width = 960 - margin.right,
                            height = 120 - margin.top - margin.bottom;
                        
                        var x = d3.time.scale()
                            .domain([now - (n - 2) * duration, now - duration])
                            .range([0, width]);
                        
                        var y = d3.scale.linear()
                            .range([height, 0]);
                        
                        var line = d3.svg.line()
                            .interpolate("basis")
                            .x(function(d, i) { return x(now - (n - 1 - i) * duration); })
                            .y(function(d, i) { return y(d); });
                        
                        var svg = d3.select("#machineGraph ." + type).append("svg")
                            .attr("width", width + margin.left + margin.right)
                            .attr("height", height + margin.top + margin.bottom)
                            .style("margin-left", -margin.left + "px")
                          .append("g")
                            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                        
                        svg.append("defs").append("clipPath")
                            .attr("id", "clip")
                          .append("rect")
                            .attr("width", width)
                            .attr("height", height);
                            
                        svg.append("g")
                              .attr("class", "y axis")
                              .call(d3.svg.axis().scale(y).ticks(5).orient("left"));
                              
                        var axis = svg.append("g")
                            .attr("class", "x axis")
                            .attr("transform", "translate(0," + height + ")")
                            .call(x.axis = d3.svg.axis().scale(x).orient("bottom"));
                        
                        var path = svg.append("g")
                            .attr("clip-path", "url(#clip)")
                          .append("path")
                            .data([graphdata])
                            .attr("class", "line");
                        
                        tick();
                        
                        d3.select(window)
                            .on("scroll", function() { ++count; });
                        
                        function tick() {
                          if(!Mist.graphPolling || !machine.hasMonitoring){
                            return;
                          }
                          // update the domains
                          now = new Date();
                          x.domain([now - (n - 2) * duration, now - duration]);
                          y.domain([0, d3.max(graphdata)]);
                        
                          // push the accumulated count onto the back, and reset the count
                          graphdata.push(count);
                          count = 0;
                        
                          // redraw the line
                          svg.select(".line")
                              .attr("d", line)
                              .attr("transform", null);
                        
                          // slide the x-axis left
                          axis.transition()
                              .duration(duration)
                              .ease("linear")
                              .call(x.axis);
                        
                          // slide the line left
                          path.transition()
                              .duration(duration)
                              .ease("linear")
                              .attr("transform", "translate(" + x(now - (n - 1) * duration) + ")")
                              .each("end", tick);
                        
                          // pop the old data point off the front
                          graphdata.shift();
                        
                        }         
                    }
                    
                    function poll(){
                        if(!Mist.graphPolling || !machine.hasMonitoring){
                            return;
                        }

                        data = {};
                        if(changes_since){
                            data.changes_since = changes_since;
                        }

                        $.ajax({
                            url: URL_PREFIX + '/backends/' + machine.backend.index + '/machines/' + machine.id + '/stats',
                            data: data,
                            dataType: 'jsonp',
                            success: function(data) {
                                info("machine stats");
                                info(data);
                                machine.stats = data;
                                changes_since=data['timestamp'],
                                setTimeout(poll, 10000);
                            }
                        }).error(function(jqXHR, textStatus, errorThrown) {
                            info('error querying for machine stats for machine id: ' + machine.id);
                            info(textStatus + " " + errorThrown);
                            setTimeout(poll, 10000);
                        });
                    }



                    poll();
                    createGraph('cpu');
                    createGraph('load');

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
