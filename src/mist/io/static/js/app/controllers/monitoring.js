define('app/controllers/monitoring', ['app/models/graph', 'app/models/metric', 'ember'],
    //
    //  Monitoring Controller
    //
    //  @returns Class
    //
    function(Graph, Metric) {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            checkingMonitoring: null,


            //
            //
            //  Initialization
            //
            //


            load: function(callback) {

                if (!Mist.authenticated) {
                    Mist.backendsController.set('checkedMonitoring', true);
                    return;
                }

                var that = this;
                this.set('checkingMonitoring', true);
                Mist.ajax.GET('/monitoring', {
                }).success(function(data) {
                    that._updateMonitoringData(data);
                }).error(function() {
                    Mist.notificationController.notify(
                        'Failed to get monitoring data');
                }).complete(function(success, data) {
                    that.set('checkingMonitoring', false);
                    Mist.backendsController.set('checkedMonitoring', true);
                    that.trigger('onMonitoringDataUpdate');
                    if (callback) callback(success, data);
                });
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            enableMonitoring: function(machine, callback, noSsh) {

                var that = this;
                machine.set('enablingMonitoring', true);

                var url = '/backends/' + machine.backend.id +
                    '/machines/' + machine.id + '/monitoring';

                Mist.ajax.POST(url, {
                    'action': 'enable',
                    'no_ssh': noSsh || false,
                    'name': machine.name || machine.id,
                    'public_ips': machine.public_ips || [],
                    'dns_name': machine.extra.dns_name || 'n/a',
                }).success(function(data) {
                    Mist.set('authenticated', true);
                    that._enableMonitoring(machine);
                }).error(function(message, statusCode) {

                    if (statusCode == 402)
                        Mist.notificationController.timeNotify(message, 5000);
                    else
                        Mist.notificationController.notify(
                            'Error when changing monitoring to ' + machine.name);

                }).complete(function(success, data) {
                    machine.set('enablingMonitoring', false);
                    if (callback) callback(success, data);
                });
            },


            disableMonitoring: function(machine, callback) {

                var that = this;
                machine.set('disablingMonitoring', true);

                var url = '/backends/' + machine.backend.id +
                    '/machines/' + machine.id + '/monitoring';

                Mist.ajax.POST(url, {
                    'action': 'disable',
                    'name': machine.name || machine.id,
                    'public_ips': machine.public_ips || [],
                    'dns_name': machine.extra.dns_name || 'n/a',
                }).success(function(data) {
                    Mist.set('authenticated', true);
                    that._disableMonitoring(machine);
                }).error(function(message, statusCode) {

                    if (statusCode == 402)
                        Mist.notificationController.timeNotify(message, 5000);
                    else
                        Mist.notificationController.notify(
                            'Error when changing monitoring to ' + machine.name);

                }).complete(function(success, data) {
                    machine.set('disablingMonitoring', false);
                    if (callback) callback(success, data);
                });
            },


            changeMonitoring: function(machine, callback) {
                if (machine.hasMonitoring)
                    this.disableMonitoring(machine, callback);
                else
                    this.enableMonitoring(machine, callback);
            },


            _enableMonitoring: function (machine) {
                Ember.run(this, function () {
                    machine.set('hasMonitoring', true);
                    machine.set('pendingFirstData', true);
                    this.trigger('onMonitoringEnable', machine);
                });
            },


            _disableMonitoring: function (machine) {
                Ember.run(this, function () {
                    machine.set('hasMonitoring', false);
                    Mist.monitored_machines.some(function(machine_tupple) {
                        if (machine.equals(machine_tupple))
                            Mist.monitored_machines.removeObject(machine_tupple);
                    });
                    this.trigger('onMonitoringDisable', machine);
                });
            },


            _updateMonitoringData: function(data) {

                Mist.set('current_plan', data.current_plan);
                Mist.set('monitored_machines', data.machines);

                Mist.metricsController.setCustomMetrics(data.custom_metrics);
                Mist.metricsController.setBuiltInMetrics(data.builtin_metrics);
                Mist.rulesController.setContent(data.rules);

                data.machines.forEach(function(machineTuple) {
                    var machine = Mist.backendsController.getMachine(
                                    machineTuple[1], machineTuple[0]);
                    if (machine)
                        machine.set('hasMonitoring', true);
                });

                Mist.backendsController.content.forEach(function(backend) {
                   backend.machines._updateMonitoredMachines();
                });
            },


            initGraphs: function (args) {

                this.reset();
                this.cookies.load();

                // Get graphs from view
                this.graphs.instances = args.graphs;

                // TODO: Change Step to seconds
                // Create and Start the request
                this.request.create({
                    machine         : args.machineModel,         // Send Current Machine
                    timeWindow      : 600000,
                    step            : 10000,                     // Metrics Step in miliseconds
                    updateInterval  : 10000,                     // Get Updates Every x Miliseconds
                    updatesEnabled  : true,                      // Get Updates
                    timeGap         : 60,                        // Gap between current time and requested
                    callback        : function (result) {
                        if (result.status == 'success')
                            Mist.monitoringController
                                .graphs.updateData(result.data);
                    }
                });

                this.UI.zoomChange()
                this.graphs.machine = args.machineModel;
                this.request.start();
            },


            reset: function () {
                this.request.reset();
                this.history.reset();
                this.graphs.reset();
                this.zoom.reset();
            },


            //
            //
            //  Request Object
            //
            //


            request: {


                create: function (args) {

                    this.reset();

                    for (var param in args)
                        this[param] = args[param];

                    this.updateData = args.updatesEnabled;

                    // Calculate start, stop and lastMetric
                    this.timeStop       = Math.floor((new Date().getTime() - this.timeGap * 1000) / 1000 );
                    this.timeStop      -= new Date(this.timeStop * 1000).getSeconds() % 10;
                    this.timeStart      = Math.floor(this.timeStop - this.timeWindow / 1000);
                    this.lastMetrictime = new Date(this.timeStart * 1000);
                },


                start: function () {

                    var self = this;
                    var that = this;

                    this.locked = true;

                    // If request stopped Re-calculate start and stop
                    if(this.initialized && !this.running) {

                        this.timeStart = Math.floor(this.lastMetrictime.getTime() /1000) ;
                        this.timeStop = Math.floor((new Date().getTime() - this.timeGap * 1000 ) / 1000);

                        // Fix time when lossing precision
                        this.timeStop -= (this.timeStop - this.timeStart) % (this.step/1000);

                    } else {
                        this.initialized = true;
                    }

                    // Show Fetching Message On Initial Request
                    this.machine.set('pendingStats', true);

                    // Do the ajax call

                    this.requestID++;
                    this.receiveData(this.timeStart, this.timeStop, this.step,
                        this.callback);

                    // Check if Data Updates Are Enabled
                    if (this.updateData && !this.running){
                        window.monitoringInterval = window.setInterval(function () {

                            // Stop updates if updateData is set to false
                            if(!self.updateData)
                                window.clearInterval(window.monitoringInterval);

                            // Lock request so no other request can be done in the same time
                            self.locked = true;

                            // Calculate Start and Stop
                            self.timeStart = Math.floor(self.lastMetrictime.getTime() / 1000);
                            self.timeStop = Math.floor(((new Date().getTime()) - self.timeGap * 1000 ) / 1000 );

                            // Fix time when lossing precision
                            self.timeStop -= (self.timeStop - self.timeStart) % (self.step/1000);

                            // Do the ajax call
                            self.requestID++;
                            self.receiveData(self.timeStart, self.timeStop, self.step, self.callback);

                        }, this.step);
                    }

                    this.running = true;

                    return this.requestID;
                },


                stop: function () {
                    this.running = false;
                    window.clearInterval(window.monitoringInterval);
                },


                /**
                *
                *   Reloads current request.
                *   @param {string} reason - Reason for reloading (default: manualReload)
                */
                reload: function(reason){

                    var self = this;

                    var reload = function(){

                        // wait until previous action (request) finishes
                        if(self.locked){
                            window.setTimeout(reload,1000);
                        }
                        else{

                           // Stop Current Request
                           self.stop();

                           reason = reason || 'manualReload'; // Not used at all?

                           // Enable/Disable updates
                           if(!self.updateData && Mist.monitoringController.graphs.animationEnabled)
                                Mist.monitoringController.graphs.disableAnimation();
                           else if( self.updateData && !Mist.monitoringController.graphs.animationEnabled)
                                Mist.monitoringController.graphs.enableAnimation();

                            Mist.monitoringController.graphs.clearData();
                            // End Of Fix

                           // Re-Initialize and start request
                           self.create({
                                machine         : self.machine,
                                timeWindow      : self.timeWindow,
                                step            : self.step,
                                updateInterval  : self.updateInterval,
                                updatesEnabled  : self.updateData,
                                timeGap         : self.timeGap,
                                callback        : self.callback
                           });

                           return self.start();
                        }

                    };

                    return reload();
                },


                /**
                *
                *   Runs a custm request without destroying the previous
                *   @param {object} options - Stop,Step,Timewindow
                */
                custom: function(options){

                    // Clear Intervals
                    this.stopDataUpdates();
                    this.machine.set('pendingStats', true);

                    // Wait Until Requests are not locked
                    var self   = this;
                    var custom = function(){

                        // wait until previous action (request) finishes
                        if(self.locked){
                            window.setTimeout(custom,1000);
                        }
                        else{

                            //var timeGap          = 60;
                            var timeWindow  = self.timeWindow;
                            var step        = self.step;
                            var stop        = Math.floor( ( new Date()).getTime() / 1000 );
                            var start       = Math.floor( stop - timeWindow/1000 );
                            var callback    = null;

                            if (options) {
                                if ('stop' in options) {
                                    stop  = Math.floor(options.stop);
                                    start = Math.floor(stop - timeWindow/1000);
                                }
                                if ('step' in options)
                                    step = options.step;
                                if ('timeWindow' in options)
                                    timeWindow = options.timeWindow;
                                if ('callback' in options)
                                    callback = options.callback;
                            }

                            self.locked = true;
                            self.machine.set('pendingStats', true);

                            if(Mist.monitoringController.graphs.animationEnabled)
                                Mist.monitoringController.graphs.disableAnimation();
                            self.receiveData(start, stop, step,callback);
                        }
                    }

                    custom();
                },


                /**
                *
                *   Resets the custom request and gets back to the original
                *
                */
                customReset: function () {
                    Mist.monitoringController.graphs.enableAnimation();
                    this.reload('customRequestReset');
                },


                changeStep: function (newStep, reloadAfter) {
                    this.step = newStep;
                    if(!reloadAfter) return;
                    this.reload('stepChanged');
                },


                changeTimeWindow: function (newTimeWindow, reloadAfter) {

                    this.timeWindow = newTimeWindow;

                    // Save cookies
                    var cookies = Mist.monitoringController.cookies;
                    cookies.timeWindow = newTimeWindow;
                    cookies.save();

                    if(!reloadAfter) return;
                    this.reload('timeWindowChanged');
                },


                enableUpdates: function (reloadAfter) {
                    this.updateData = true;
                    if(!reloadAfter) return;
                    this.reload('updatesEnabled');
                },


                disableUpdates: function (reloadAfter) {
                    this.updateData = false;
                    if(!reloadAfter) return;
                    this.reload('updatesDisabled');
                }.observes('machine.isDestroying'),


                stopDataUpdates: function () {
                    window.clearInterval(window.monitoringInterval);
                },


                /**
                *
                *   Does an ajax request to the server
                *   @param {number} start - The start time in seconds of requested measurements
                *   @param {number} stop  - The stop  time in seconds of requested measurements
                *   @param {number} step  - The step in miliseconds of requested measurements
                *   @param {function} callback - The function that will be called when request has finished.
                */
                receiveData: function(start, stop, step, callback) {

                    var requestID  = this.requestID;
                    var controller = Mist.monitoringController;
                    var self = this;

                    $.ajax({
                        url: '/backends/' + self.machine.backend.id +
                             '/machines/' + self.machine.id + '/stats',
                        type: 'GET',
                        async: true,
                        dataType: 'json',
                        data: {
                            start: start - 50,
                            stop: stop + 50,
                            step: step / 1000
                        },
                        timeout: 8000,
                        success: function (metrics) {

                            try {

                                if (!Object.keys(metrics).length)
                                    throw "No Data Received";

                                var receivedData = {};
                                var hasFirstData = false;

                                for (var metricId in metrics) {

                                    var metric = metrics[metricId];
                                    var id = metricId;
                                    metric.id = id;
                                    metric = Metric.create(metric);

                                    receivedData[id] = [];

                                    metric.datapoints.forEach(function (datapoint) {

                                        if (datapoint[1] > stop)
                                            return;
                                        if (datapoint[1] <= start)
                                            return;
                                        if (datapoint[0] != null)
                                            hasFirstData = true;

                                        receivedData[id].push({
                                            time: new Date(datapoint[1]*1000),
                                            value: datapoint[0]
                                        });
                                    });

                                    metric.datapoints = receivedData[id];
                                    Mist.monitoringController.graphs.addGraph(metric);
                                }

                                var metric = Object.keys(receivedData)[0];
                                var datapoints = receivedData[metric];
                                self.lastMetrictime = datapoints[datapoints.length - 1].time;

                                if (self.machine.pendingFirstData)
                                    self.machine.set('pendingFirstData', !hasFirstData);

                                callback({
                                    status: 'success',
                                    data  : receivedData
                                });
                                $(document).trigger('finishedFetching', [
                                    requestID,
                                    'success'
                                ]);

                            } catch(err) {

                                error(err);
                                callback({
                                    status: 'error',
                                    error: err
                                });
                                $(document).trigger('finishedFetching', [
                                    requestID,
                                    'failure'
                                ]);
                            }
                        },
                        error: function(jqXHR, textStatus, errorThrown) {

                            if (errorThrown == 'timeout')
                                // When monitoring is disabled ajax call may be still run one time.
                                // So we won't display error if it is disabled
                                if (self.machine.hasMonitoring)
                                    Mist.notificationController.timeNotify(
                                        "Data request timed out. " +
                                        "Network connection is down or server doesn't respond",
                                        4000);
                            else
                                error(textStatus);

                            callback({
                                status: 'error',
                                error: errorThrown
                            });
                            $(document).trigger('finishedFetching', [
                                requestID,
                                'failure'
                            ]);
                        },
                        complete: function () {
                            if (self.machine) { // machine may not exist
                                self.machine.set('pendingStats', false);
                                self.locked = false;
                            }
                        }
                    });
                },


                printInfo: function () {
                    console.log("Time Window    : " + (this.timeWindow / 1000) + " seconds");
                    console.log("Last Metric    : " + this.lastMetrictime);
                    console.log("Start          : " + (new Date(this.timeStart * 1000)));
                    console.log("Stop           : " + (new Date(this.timeStop * 1000)));
                    console.log("Step           : " + (this.step / 1000) + " seconds");
                    console.log("Update Interval: " + this.updateInterval)
                },


                reset: function () {
                    this.machine        = null;
                    this.lastMetrictime = null;
                    this.callback       = function () {};
                    this.timeWindow     = 0;
                    this.timeStart      = 0;
                    this.timeStop       = 0;
                    this.timeGap        = 0;
                    this.step           = 0;
                    this.updateData     = false;
                    this.updateInterval = 0;
                    this.locked         = false;
                    this.running        = false;
                    this.initialized    = false;
                    this.requestID      = 0;
                },


                machine        : null,  // The current machine
                lastMetrictime : null,  // Date Object
                callback       : null,  // Function
                timeWindow     : 0,     // integer in miliseconds
                timeStart      : 0,     // integer in seconds
                timeStop       : 0,     // integer in seconds
                step           : 0,     // integer in miliseconds
                timeGap        : 0,     // integer in seconds
                updateInterval : 0,     // integer in miliseconds
                updateData     : false, // boolean
                locked         : false, // boolean
                running        : false, // boolean
                initialized    : false, // boolean
                requestID      : 0,     // integer index

            }, // Request Object


            //
            //
            //  UI
            //
            //


            UI : {

                collapsePressed: function (graph) {
                    Mist.monitoringController.graphs.collapse([graph]);
                },

                expandPressed: function (graph) {
                    Mist.monitoringController.graphs.expand([graph]);
                },

                zoomChange: function () {
                    var zoomIndex = $('#zoomSelect :selected').val();
                    Mist.monitoringController.zoom.toIndex(zoomIndex);
                }

            }, // UI Object


            //
            //
            //  Graphs
            //
            //


            graphs : {


                enableAnimation: function () {
                    this.instances.forEach(function (graph) {
                        graph.view.enableAnimation();
                    });
                    this.animationEnabled = true;
                },


                /**
                *
                *   Disable animation of all graphs
                *   @param {boolean} stopCurrent - Stop current animation or Stop animation on next update
                */
                disableAnimation: function (stopCurrent) {

                    if (typeof stopCurrent == 'undefinded')
                        stopCurrent = true;

                    this.instances.forEach(function (graph) {
                        graph.view.disableAnimation(stopCurrent);
                    });
                    this.animationEnabled = false;
                },


                changeTimeWindow: function (newTimeWindow) {
                    this.instances.forEach(function (graph) {
                        graph.view.changeTimeWindow(newTimeWindow);
                    });
                },


                updateData: function (data) {

                    this.updateActions.before.forEach(function (action) {
                        action();
                    });
                    this.instances.forEach(function (graph) {
                        graph.updateData(data);
                    });
                    this.updateActions.after.forEach(function (action) {
                        action();
                    });
                    this.clearUpdateActions();
                },


                clearData: function () {
                    this.instances.forEach(function (graph) {
                        graph.view.clearData();
                    });
                },


                /**
                *
                *  Collapse selected metrics
                *  Possible to set animation duration
                */
                collapse: function (metrics, duration) {

                    // Mobile Hide Animation is slow, disabling animation
                    var hideDuration = duration || 400;

                    if (Mist.isClientMobile)
                        hideDuration = 0;

                    // Add graph to the end of the list
                    metrics.forEach(function (metric) {

                        // Hide the Graphs
                        $("#" + metric).hide(hideDuration, function () {

                            // Show button
                            $("#" + metric + '-btn').show();

                            // Save cookies
                            var cookies = Mist.monitoringController.cookies
                            cookies.collapsedGraphs.addObject(metric.replace('graph-', ''));
                            cookies.save();
                        });
                    });
                },


                /**
                *
                *  Expands selected metrics
                *  Possible to set animation duration
                */
                expand: function (metrics,duration) {

                    // Mobile Hide Animation is slow, disabling animation
                    var hideDuration = duration || 400;

                    if (Mist.isClientMobile)
                        hideDuration = 0;

                    // Add graph to the end of the list
                    metrics.forEach(function (metric) {

                        // Hide button
                        $("#" + metric + "-btn").hide();

                        // Get graph
                        var parent = $("#" + metric).parent();

                        // Get script tags
                        var prev = parent.prev();
                        var next = parent.next();

                        // Move to end
                        moveToEnd(prev);
                        moveToEnd(parent);
                        moveToEnd(next);

                        $("#" + metric).show(hideDuration, function(){

                            // Save cookies
                            var cookies = Mist.monitoringController.cookies
                            cookies.collapsedGraphs.removeObject(metric.replace('graph-', ''));
                            cookies.save();
                        });

                        Mist.monitoringController.graphs
                            .instances.findBy('id', metric)
                            .view.updateView();
                    });

                    function moveToEnd(element) {
                        element.detach().appendTo('#graphs');
                    };
                },


                /*
                * add a function to be called before or after updating graphs
                * @param {string}   when   - Posible values 'before' or 'after' (updating)
                * @param {function} action - The function that will run before or after updating
                */
                addNextUpdateAction: function (when, action) {

                    if (when == 'before')
                        this.updateActions.before.push(action);
                    else
                        this.updateActions.after.push(action);
                },


                clearUpdateActions: function (){
                    this.updateActions.before = [];
                    this.updateActions.after  = [];
                },


                reset: function () {
                    this.clearUpdateActions();
                    this.animationEnabled = true;
                    this.instances = [];
                },


                getGraphByMetricName: function (metric) {
                    var retGraph = null;
                    this.instances.some(function (graph) {
                        if (graph.metrics.findBy('name', metric)) {
                            return retGraph = graph;
                        }
                    });
                    return retGraph;
                },


                graphExists: function (graphId) {
                    return !!this.instances.findBy('id', graphId);
                },


                addGraph: function (metric) {

                    var graphId = 'graph-' + metric.hashedId;

                    if (this.graphExists(graphId))
                        return;

                    var MetricsCon = Mist.metricsController;

                    var graph = Graph.create({
                            id: graphId,
                            unit: metric.unit,
                            title: metric.name,
                            isBuiltIn: MetricsCon.isBuiltInMetric(metric.id)
                        });

                    // If metric does not exist, add it
                    if (!MetricsCon.getMetric(metric.id)) {
                        info('Doesnt exist ', metric.id);
                        MetricsCon._addMetric(metric, this.machine);
                    }

                    var metricModel = MetricsCon.getMetric(metric.id);
                    metricModel.set('datapoints', metric.datapoints);

                    graph.addMetric(metricModel);
                    this.instances.pushObject(graph);
                },


                removeGraph: function (graph) {
                    var that = this;
                    Mist.metricsController.disassociateMetric(
                        graph.metrics[0],
                        this.machine,
                        function (success) {
                            if (success) {
                                that.instances.removeObject(graph);
                            }
                    });
                },

                machine          : null,
                instances        : [],
                animationEnabled : true,
                updateActions    : {
                    before : [],
                    after  : []
                }

            }, // Graphs Object


            //
            //
            //  Cookies
            //
            //


            cookies: {


                timeWindow: null,
                collapsedGraphs: null,


                load: function () {

                    this.disableOldCookie();

                    if (document.cookie.indexOf('mistio-monitoring') == -1)
                        this.save();

                    var info = {};

                    // Seperate monitoring information out of
                    // cookie values

                    var values = document.cookie.split(';');

                    values.some(function (value) {
                        if (value.indexOf('mistio-monitoring=') > -1)
                            return info = JSON.parse(
                                value.replace('mistio-monitoring=', ''));
                    });

                    this.timeWindow = info.timeWindow || 600000;
                    this.collapsedGraphs = info.collapsedGraphs || [];
                },


                save: function (metrics) {

                    var cookieExpire = new Date();
                    cookieExpire.setFullYear(cookieExpire.getFullYear() + 2);

                    var cookie = "mistio-monitoring=" + JSON.stringify({
                        timeWindow: this.timeWindow,
                        collapsedGraphs: this.collapsedGraphs
                    }) +
                    '; expires=' + cookieExpire.toUTCString() +
                    '; path=/';

                    document.cookie = cookie;
                },


                get: function () {

                },


                disableOldCookie: function () {
                    if (document.cookie.indexOf('collapsedGraphs') > -1)
                        document.cookie = 'collapsedGraphs=;' +
                            'expires=Thu, 01 Jan 1970 00:00:01 GMT';
                }
            },


            //
            //
            //  Zoom
            //
            //


            zoom : {

                in: function () {
                    if (this.zoomIndex > 0) {
                        this.zoomIndex--;
                        this.to(this.zoomValues[this.zoomIndex].value * 60000); // (60*1000)
                    }
                },


                out: function () {

                    if(this.zoomIndex < this.zoomValues.length-1) {
                        this.zoomIndex++;
                        this.to(this.zoomValues[this.zoomIndex].value * 60000); // (60*1000)
                    }
                },


                toIndex: function (zoomIndex) {

                    if(zoomIndex != this.zoomIndex) {

                        this.prevZoomIndex = this.zoomIndex
                        this.zoomIndex     = zoomIndex;
                        this.to(this.zoomValues[zoomIndex].value * 60000,'to'); // (60*1000)
                    }
                },


                // direction is optional, used for in and out
                to: function (timeWindow, direction) {

                    var controller = Mist.monitoringController;
                    var self = this;
                    //direction = (typeof direction == 'undefined' ? null : direction);

                    var zoom = function () {

                        // Check if request is pending
                        if (controller.request.locked) {
                            window.setTimeout(zoom,1000);
                            return;
                        }

                        var changeTimeWindow = function () {
                            controller.graphs.changeTimeWindow(timeWindow);
                        }

                        controller.graphs.addNextUpdateAction('before', changeTimeWindow);

                        var measurements = 60;
                        var timeWindowInMinutes = timeWindow / 60000;
                        var newStep = Math.round((timeWindowInMinutes * 60 / measurements) * 1000);
                        controller.request.changeStep(newStep, false);
                        controller.request.changeTimeWindow(timeWindow, false);

                        // When we have more than 10 minutes time window we don't really need updates
                        if(timeWindowInMinutes > 10)
                            controller.request.disableUpdates(false);
                        else
                            controller.request.enableUpdates(false);

                        var zoomID = controller.request.reload();

                        $(document).one('finishedFetching',function(event,requestID,status){

                            if (zoomID == requestID)
                                self.enable();

                            if (status != 'success') {

                                // Revert Index
                                if(direction == 'in')
                                    self.zoomIndex++;
                                else if(direction == 'out')
                                    self.zoomIndex--;
                                else if(direction == 'to')
                                    self.zoomIndex = self.prevZoomIndex;

                                self.setZoomUI(self.zoomIndex);
                            }

                            self.enable();
                            Mist.monitoringController.history.enableControls();
                        });
                    };

                    controller.request.stop();

                    // Show pending stats popup before data request because if previous request
                    // takes place this feature may appear as broken
                    Mist.monitoringController.request.machine.set('pendingStats', true);

                    // Disable change time window button
                    this.disable();

                    // Temporary Disable History Controls
                    Mist.monitoringController.history.disableControls();
                    zoom();
                },


                setZoomUI: function (index) {

                    document.getElementById('zoomSelect').options[this.zoomIndex].selected = 'selected';
                    $('#zoomSelect-button').find('span').text($('#zoomSelect').find(':selected').text());
                },


                disable: function () {
                    $('#zoomSelect-button *').addClass('ui-state-disabled');
                },


                enable: function () {
                    $('#zoomSelect-button *').removeClass('ui-state-disabled');
                },


                reset: function () {

                    this.zoomIndex     = 0;
                    this.prevZoomIndex = 0;
                    this.setZoomUI(this.zoomIndex);
                },


                zoomValues: [ // in minitues
                        { label: '10 minutes', value: 10    },
                        { label: '1 hour    ', value: 60    },
                        { label: '1 day     ', value: 1440  }, // (24*60)
                        { label: '1 week    ', value: 10080 }, // (7*24*60)
                        { label: '1 month   ', value: 43200 }  // (30*24*60)
                ],


                zoomIndex    : 0,
                prevZoomIndex: 0

            }, // Zoom object


            //
            //
            //  History
            //
            //


            history : {


                goBack: function () {

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    // When we enable history we must get last measurement and time window
                    if(!this.isEnabled)
                        this.enable();
                    else
                        this.currentStopTime = new Date(
                            this.currentStopTime - this.timeWindow);

                    request.custom({
                        stop     : (+this.currentStopTime / 1000),
                        callback : function (result) {
                            // On error set currentStop where it was
                            if(result.status == 'success')
                                Mist.monitoringController.graphs.updateData(result.data);
                            else {
                                self.currentStopTime = new Date(+self.currentStopTime + self.timeWindow);
                                if(self.currentStopTime.getTime() == self.lastMetrictime.getTime())
                                    self.disable();
                            }
                        }
                    });
                },


                /**
                *
                *   Go a timewindow forward
                *   Also disables history if it is in the last history block
                */
                goForward: function () {

                    if(!this.isEnabled) return;

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    this.currentStopTime = new Date(+this.currentStopTime + this.timeWindow);

                    // If Next Block of time is ahead of last Metric Disable Monitoring
                    if((+this.currentStopTime) > (+this.lastMetrictime))
                        this.disable();
                    else
                        request.custom({
                            stop     : (+this.currentStopTime / 1000),
                            callback : function (result) {
                                // On error set currentStop where it was
                                if(result.status == 'success')
                                    Mist.monitoringController.graphs.updateData(result.data);
                                else
                                    self.currentStopTime = new Date(+self.currentStopTime - self.timeWindow);
                            }
                        });
                },


                enable: function () {

                    if(this.isEnabled) return;

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    this.isEnabled       = true;
                    this.timeWindow      = request.timeWindow;
                    this.lastMetrictime  = request.lastMetrictime;
                    this.currentStopTime = new Date(this.lastMetrictime.getTime() - this.timeWindow);

                    $('#graphsGoForward').removeClass('ui-state-disabled');
                    $('#graphsResetHistory').removeClass('ui-state-disabled');

                    Mist.monitoringController.zoom.disable();
                },


                disable: function () {

                    this.isEnabled = false;
                    Mist.monitoringController.request.customReset();

                    $('#graphsGoForward').addClass('ui-state-disabled');
                    $('#graphsResetHistory').addClass('ui-state-disabled');

                    Mist.monitoringController.zoom.enable();
                },


                disableControls: function () {
                    $('#graphsGoBack').addClass('ui-state-disabled');
                    $('#graphsGoForward').addClass('ui-state-disabled');
                    $('#graphsResetHistory').addClass('ui-state-disabled');
                },


                enableControls: function () {
                    $('#graphsGoBack').removeClass('ui-state-disabled');
                    if(this.isEnabled){
                        $('#graphsGoForward').removeClass('ui-state-disabled');
                        $('#graphsResetHistory').removeClass('ui-state-disabled');
                    }
                },


                reset: function () {
                    this.isEnabled       = false;
                    this.lastMetrictime  = null;
                    this.timeWindow      = 0;
                    this.currentStopTime = null;
                },


                isEnabled       : false,
                lastMetrictime  : null,
                timeWindow      : 0,
                currentStopTime : null

            } // History Object
        })
    }
);
