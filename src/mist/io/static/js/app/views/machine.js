define('app/views/machine', [
    'app/views/mistscreen',
    'text!app/templates/machine.html', 'ember'],
    /**
     *
     * Machine page
     *
     * @returns Class
     */
    function(MistScreen, machine_html) {
        return MistScreen.extend({

            template: Ember.Handlebars.compile(machine_html),

            init: function() {
                this._super();
                this.setGraph();
            },
            
            rules: function(){
                var ret = Ember.ArrayController.create(), 
                    machine = this.get('controller').get('model');
                Mist.rulesController.forEach(function(rule){
                    if (rule.machine == machine) {
                        ret.pushObject(rule);
                    }
                });
                return ret;
            }.property('Mist.rulesController.@each'),

            disabledShellClass: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.hasKey && machine.state == 'running') {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('controller.model.hasKey'),

            disabledTagClass: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.can_tag) {
                    return '';
                } else {
                    return 'ui-disabled';
                }
            }.property('controller.model.can_tag'),

            disabledPowerClass: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.state === 'terminated') {
                    return 'ui-disabled';
                } else {
                    return '';
                }
            }.property('controller.model.state'),

            metadata: function() {
                var machine = this.get('controller').get('model');
                if (!machine || !machine.extra) {
                    return [];
                }
                var ret = new Array();

                $.each(machine.extra, function(key, value) {
                    if (typeof(value) == 'string' || typeof(value) == 'number') {
                        ret.push({key:key, value: value});
                    }
                });
                return ret;
            }.property('controller.model'),
            
            keySelect: function(key) {
                var machine = this.get('controller').get('model');
                Mist.keysController.associateKey(key.name, machine);
                $('#associate-key').popup('close');
                return false;
            },

            basicvars: function() {
                var machine = this.get('controller').get('model');

                if (!machine) {
                    return [];
                }

                var publicIps = null;

                if ($.isArray(machine.public_ips)) {
                    publicIps = machine.public_ips.join();
                } else if (typeof machine.public_ips === 'string') {
                    publicIps = machine.public_ips;
                }

                var privateIps = null;

                if ($.isArray(machine.private_ips)) {
                    privateIps = machine.private_ips.join();
                } else if (typeof machine.private_ips === 'string') {
                    privateIps = machine.private_ips;
                }

                var basicvars = {
                        'Public IPs': publicIps,
                        'Private IPs': privateIps,
                        'DNS Name': machine.extra.dns_name,
                        'Launch Date': machine.extra.launchdatetime
                };

                if (machine.image && 'image' in machine &&
                        'name' in machine.image) {
                    basicvars['Image'] = machine.image.name;
                }

                var ret = new Array();

                $.each(basicvars, function(key, value) {
                    if (typeof(value) == 'string') {
                        ret.push({key:key, value: value});
                    }
                });

                return ret;

            }.property('controller.model'),

            name: function() {
                var machine = this.get('controller').get('model');
                if (!machine) {
                    return '';
                }
                return machine.name || machine.id;
            }.property('controller.model'),

            upFor: function() {
                var machine = this.get('controller').get('model');

                if (machine && machine.uptime) {
                    var ret = '';
                    var x = Math.floor(machine.uptime / 1000);

                    var seconds = x % 60;
                    x = Math.floor(x / 60);
                    var minutes = x % 60;
                    x = Math.floor(x / 60);
                    var hours = x % 24;
                    x = Math.floor(x / 24);
                    var days = x;

                    if (days) {
                        ret = ret + days + ' days, ';
                    }

                    if (hours) {
                        ret = ret + hours + ' hours, ';
                    }

                    if (minutes) {
                        ret = ret + minutes + ' minutes, ';
                    }

                    if (seconds) {
                        ret = ret + seconds + ' seconds';
                    } else {
                        ret = ret + '0 seconds';
                    }

                    return ret;

                } else {
                    return '';
                }
            }.property('controller.model.uptime'),

            providerIconClass: function() {
                var machine = this.get('controller').get('model');
                if (!machine) {
                    return '';
                }
                return 'provider-' + machine.backend.provider;
            }.property('controller.model'),

            addRuleClicked: function() {
                // initialize the rule to some sensible defaults
                var machine = this.get('controller').get('model');
                var metric = 'load';
                var operator = {'title': 'gt', 'symbol': '>'};
                var value = 60;
                var actionToTake = 'alert';

                Mist.rulesController.newRule(machine, metric, operator, value, actionToTake);
            },

            setGraph: function() {
                Em.run.next(function() {
                    try{
                        $('.monitoring-button').button();
                        $('#add-rule-button').button();
                        $('#monitoring-dialog').popup();                        
                    } catch(err){}
                });

                var machine = this.get('controller').get('model');

                if (!machine || !machine.hasMonitoring) {
                    if (this.context) {
                        this.context.stop();
                        $('#cpuGraph').empty();
                        $('#memoryGraph').empty();
                        $('#diskGraph').empty();
                        $('#networkGraph').empty();
                        $('#loadGraph').empty();
                    }
                    return;
                }

                var that = this;

                machine.set('pendingStats', true);

                Em.run.next(function() {
                    var context = cubism.context()
                                        .serverDelay(0)
                                        .clientDelay(0)
                                        .step(10000)
                                        .size($(window).width() - 80);
                    Mist.context = context;

                    var localData = null;
                    var cores = null;
                    var networkInterfaces = null;
                    var disks = null;
                    var memoryTotal = false;
                    var loaded = false;

                    function drawCpu() {
                        return context.metric(function(start, stop, step, callback) {
                            start = +start;
                            stop = +stop;

                            if (machine.hasMonitoring) {
                                $.ajax({
                                    url: URL_PREFIX + '/backends/' + machine.backend.id +
                                         '/machines/' + machine.id + '/stats',
                                    type: 'GET',
                                    async: loaded,
                                    dataType: 'jsonp',
                                    data: {'start': (start / 1000),
                                           'stop': (stop / 1000),
                                           'step': step,
                                           'auth_key': Mist.auth_key},
                                    timeout: 4000,
                                    success: function(data) {
                                        if (!data || !('cpu' in data)) {
                                            return callback(new Error('unable to load data'));
                                        } else {
                                            loaded = true;
                                            localData = data;

                                            if (!cores) {
                                                cores = data['cpu']['cores'];
                                            }

                                            if (!networkInterfaces) {
                                                configureNetworkGraphs();
                                            }

                                            if (!disks) {
                                                configureDiskGraphs();
                                            }
                                        }
                                        machine.set('pendingStats', false);
                                    },
                                    error: function(jqXHR, textstate, errorThrown) {
                                        error('could not load monitoring data');
                                        //Mist.context.stop();
                                    }
                                });

                                if (localData && machine.hasMonitoring && cores) {
                                    return callback(null, localData['cpu']['utilization'].map(function(d) {
                                        return (d / cores) * 100;
                                    }));
                                } else {
                                    return callback(new Error('unable to load data'));
                                }

                            } else {
                                return callback(new Error('monitoring disabled'));
                            }
                        }, 'CPU');
                    }

                    function drawMemory() {
                        return context.metric(function(start, stop, step, callback) {
                            if (localData && machine.hasMonitoring && 'memory' in localData) {
                                if (!memoryTotal) {
                                    memoryTotal = localData['memory']['total'];
                                }
                                return callback(null, localData['memory']['used'].map(function(d) {
                                    return (d / memoryTotal) * 100;
                                }));
                            } else {
                                return callback(new Error('unable to load data'));
                            }
                        }, 'RAM');
                    }

                    function drawDisk(disk, ioMethod) {
                        return context.metric(function(start, stop, step, callback) {

                            if (localData && machine.hasMonitoring &&
                                'disk' in localData &&
                                ioMethod in localData.disk &&
                                disk in localData.disk[ioMethod] &&
                                'disk_ops' in localData.disk[ioMethod][disk]) {

                                return callback(null, localData['disk'][ioMethod][disk]['disk_ops'].map(function(d) {
                                    return d;
                                }));
                            } else {
                                return callback(new Error('unable to load data'));
                            }
                        }, 'DISK (' + disk + ', ' + ioMethod + ') ');
                    }

                    function drawLoad() {
                        return context.metric(function(start, stop, step, callback) {
                            if (localData && machine.hasMonitoring && 'load' in localData) {
                                return callback(null, localData['load'].map(function(d) {
                                    return d;
                                }));
                            } else {
                                return callback(new Error('unable to load data'));
                            }
                        }, 'LOAD ');
                    }

                    function drawNetwork(iface, stream) {
                        return context.metric(function(start, stop, step, callback) {

                            if (localData &&
                                machine.hasMonitoring &&
                                'network' in localData &&
                                iface in localData.network &&
                                stream in localData.network[iface]) {

                                return callback(null, localData['network'][iface][stream].map(function(d) {
                                    return d;
                                }));
                            } else {
                                return callback(new Error('unable to load data'));
                            }
                        }, 'NET (' + iface + ', ' + stream  + ') ');
                    }

                    function configureNetworkGraphs() {
                        networkInterfaces = [];
                        var data = [];
                        for (iface in localData['network']) {
                            networkInterfaces.push(iface);
                            data.push(drawNetwork(iface, 'tx'));
                            data.push(drawNetwork(iface, 'rx'));
                        }

                        d3.select('#networkGraph').call(function(div) {
                            div.selectAll('.horizon')
                               .data(data)
                               .enter()
                               .append('div')
                               .attr('class', 'horizon')
                               .call(context.horizon());
                            div.append('div').attr('class', 'rule').call(context.rule());
                        });
                    }

                    function configureDiskGraphs() {
                        disks = [];
                        data = [];

                        for (disk in localData['disk']['read']) {
                            disks.push(disk);
                            data.push(drawDisk(disk, 'read'));
                            data.push(drawDisk(disk, 'write'));
                        }

                        d3.select('#diskGraph').call(function(div) {
                            div.selectAll('.horizon')
                               .data(data)
                               .enter()
                               .append('div')
                               .attr('class', 'horizon')
                               .call(context.horizon());
                            div.append('div').attr('class', 'rule').call(context.rule());
                        });
                    }

                    var cpu = drawCpu();
                    var memory = drawMemory();
                    var load = drawLoad();

                    d3.select('#cpuGraph').call(function(div) {
                        div.append('div').attr('class', 'axis').call(context.axis().orient('top'));
                        div.selectAll('.horizon')
                           .data([cpu])
                           .enter()
                           .append('div')
                           .attr('class', 'horizon')
                           .call(context.horizon());
                        div.append('div').attr('class', 'rule').call(context.rule());
                    });

                    d3.select('#memoryGraph').call(function(div) {
                        div.selectAll('.horizon')
                           .data([memory])
                           .enter()
                           .append('div')
                           .attr('class', 'horizon')
                           .call(context.horizon());
                        div.append('div').attr('class', 'rule').call(context.rule());
                    });

                    d3.select('#loadGraph').call(function(div) {
                        div.selectAll('.horizon')
                           .data([load])
                           .enter()
                           .append('div')
                           .attr('class', 'horizon')
                           .call(context.horizon());
                        div.append('div').attr('class', 'rule').call(context.rule());
                    });

                    context.on('focus', function(i) {
                        d3.selectAll('.value').style('right', i == null ? null : context.size() - i + 'px');
                    });
                });

                Mist.rulesController.redrawRules();
            }.observes('controller.model.hasMonitoring'),

            stopPolling: function() {
                // if it polls for stats, stop it
                if ('context' in Mist) {
                    Mist.context.stop();
                }
            }.observes('controller.model.hasMonitoring'),

            backClicked: function() {
                this.stopPolling();
                // then get back to machines' list
                Mist.Router.router.transitionTo('machines')
            },

            handlePendingMonitoring: function() {
                var machine = this.get('controller').get('model');
                if (machine && machine.pendingMonitoring) {
                    $('.pending-monitoring').show();
                    $('.monitoring-button').addClass('ui-disabled'); //.hide();
                } else {
                    $('.monitoring-button').removeClass('ui-disabled'); //.show();
                    $('.pending-monitoring').hide();
                }
            }.observes('controller.model.pendingMonitoring'),

            showShell: function() {
                $("#dialog-shell").popup('option', 'positionTo', '#machines-button-shell')
                                  .popup('open', {transition: 'slideup', });
                $("#dialog-shell").on('popupafterclose', 
                    function(){
                        $(window).off('resize');
                    }
                );
                
                Ember.run.next(function(){
                    $(window).on('resize', function(){
                        $('#dialog-shell-popup').css({'left':'5%','width':'90%'});
                        $('.shell-return').css({'height': (0.6*$(window).height()) + 'px'});
                        $('.shell-input input').focus();
                        return false;
                    });
                    $(window).trigger('resize');     
                });                
            },

            showActions: function() {
                $("#dialog-single-power").popup('option', 'positionTo', '#machines-button-power').popup('open', {transition: 'slideup'});
            },

            openTags: function() {
                $("#dialog-tags").popup('option', 'positionTo', '#machines-button-tags').popup('open', {transition: 'slideup'});
            },

            associateClicked: function() {
                $('.key-list').listview('refresh');
                $('#associate-key').popup('option', 'positionTo', '#associate-key-button').popup('open');
            }
        });
    }
);
