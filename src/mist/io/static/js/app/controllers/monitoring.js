define('app/controllers/monitoring', [
    'ember'
    ],
    /**
     * Monitoring Controller
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend(Ember.Evented,{

            /**
             *
             * Gets all monitoring related data from
             * the server
             */
            load: function(callback) {

                if (!Mist.authenticated) {
                    Mist.backendsController.set('checkedMonitoring', true);
                    return;
                }

                var that = this;
                this.checkingMonitoring = true;
                Mist.ajax.GET('/monitoring', {
                }).success(function(data) {
                    that._updateMonitoringData(data);
                }).error(function() {
                    Mist.notificationController.notify('Failed to get monitoring data');
                }).complete(function(success, data) {
                    that.checkingMonitoring = false;
                    Mist.backendsController.set('checkedMonitoring', true);
                    that.trigger('onMonitoringDataUpdate');
                    if (callback) callback(success, data);
                });
            }.on('init'),


            enableMonitoring: function(machine, callback, no_ssh) {

                var that = this;
                machine.set('enablingMonitoring', true);
                Mist.ajax.POST('/backends/' + machine.backend.id + '/machines/' + machine.id + '/monitoring', {
                    'action': 'enable',
                    'dns_name': machine.extra.dns_name ? machine.extra.dns_name : 'n/a',
                    'public_ips': machine.public_ips ? machine.public_ips : [],
                    'name': machine.name ? machine.name : machine.id,
                    'no_ssh': no_ssh || false,
                }).success(function(data) {

                    Mist.set('authenticated', true);
                    machine.set('hasMonitoring', true);
                    machine.set('pendingFirstData', true);
                    machine.set('enablingMonitoring', false);

                }).error(function(message, statusCode) {

                    machine.set('enablingMonitoring', false);
                    if (statusCode == 402) {
                        Mist.notificationController.timeNotify(message, 5000);
                    } else {
                        Mist.notificationController.notify('Error when changing monitoring to ' + machine.name);
                    }
                }).complete(function(success, data) {
                    if (callback) callback(success, data);
                });
            },


            disableMonitoring: function(machine, callback) {

                var that = this;
                machine.set('disablingMonitoring', true);
                Mist.ajax.POST('/backends/' + machine.backend.id + '/machines/' + machine.id + '/monitoring', {
                    'action': 'disable',
                    'dns_name': machine.extra.dns_name ? machine.extra.dns_name : 'n/a',
                    'public_ips': machine.public_ips ? machine.public_ips : [],
                    'name': machine.name ? machine.name : machine.id
                }).success(function(data) {

                    machine.set('hasMonitoring', false);
                    // Remove machine from monitored_machines
                    Mist.monitored_machines.some(function(machine_tupple) {
                        if (machine_tupple[1] == machine.id &&
                            machine_tupple[0] == machine.backend.id) {
                                Mist.monitored_machines.removeObject(machine_tupple);
                        }
                    });
                    machine.set('disablingMonitoring', false);
                    Mist.set('authenticated', true);

                }).error(function(message, statusCode) {

                    machine.set('disablingMonitoring', false);
                    if (statusCode == 402) {
                        Mist.notificationController.timeNotify(message, 5000);
                    } else {
                        Mist.notificationController.notify('Error when changing monitoring to ' + machine.name);
                    }
                }).complete(function(success, data) {
                    if (callback) callback(success, data);
                });
            },


            changeMonitoring: function(machine, callback) {

                if (machine.hasMonitoring) {
                    this.disableMonitoring(machine, callback);
                } else {
                    this.enableMonitoring(machine, callback);
                }
            },

             /**
             *
             * Updates everything in the app that has
             * to do with monitoring
             */
             _updateMonitoringData: function(data) {

                 Mist.set('monitored_machines', data.machines);
                 Mist.set('current_plan', data.current_plan);
                 Mist.rulesController.setContent(data.rules);
                 data.machines.forEach(function(machine_tuple) {
                     var machine = Mist.backendsController.getMachine(machine_tuple[1], machine_tuple[0]);
                     if (machine)
                         machine.set('hasMonitoring', true);
                 });
                 Mist.backendsController.content.forEach(function(backend) {
                    backend.machines._updateMonitoredMachines();
                 });
             },


            /*
            *
            * Initalizes Request,Graphs,History objects
            * Loads cookies and hides collapsed graphs
            * @param {object} arguments - machine,timeWindow,step,updateInterval,updatesEnabled,timeGap,callback
            */
            initialize: function(arguments){

                var self = this;

                // Reset all controller values
                this.reset();

                // Get graphs from view
                this.graphs.instances = arguments.graphs;

                // Get cookies and show graphs that are not collapsed
                var collapsedMetrics = this.cookies.getCollapsedMetrics();

                if(collapsedMetrics != null) {
                    this.graphs.collapse(collapsedMetrics,0);
                } else{

                    // Hide graphs
                    var metrics     = this.graphs.instances;
                    var metricsKeys = [];

                    for(var key in metrics){

                        if(key == 'load') continue;
                        metricsKeys.push(key);
                    }

                    this.graphs.collapse(metricsKeys,0);
                }

                // TODO Change Step to seconds
                // Create and Start the request
                this.request.create({
                    machine         : arguments.machineModel, // Send Current Machine
                    timeWindow      : 10*60*1000,                // Display 10 Minutes
                    step            : 10000,                     // Metrics Step in miliseconds
                    updateInterval  : 10000,                     // Get Updates Every x Miliseconds
                    updatesEnabled  : true,                      // Get Updates
                    timeGap         : 60,                        // Gap between current time and requested
                    callback        : function(result){
                        if(result.status == 'success'){
                            self.graphs.updateData(result.data);
                        }
                    }
                });
                // Disable updates if machine is being destroyed
                arguments.machineModel.addObserver("beingDestroyed",function(){
                    if(self.request.machine && self.request.machine.beingDestroyed)
                        self.request.disableUpdates(false);
                });

                this.request.start();

            },


            /**
            *
            *   Resets all controller instances to the default state
            *
            */
            reset: function(){

                this.request.reset();
                this.history.reset();
                this.graphs.reset();
                this.zoom.reset();
            },


            /**
            *
            *   This object is responsible for data requests
            *
            */
            request: {


                /**
                *   Creates the request. use start() to start the request
                *   @param {number}  timeWindow     - The time window in miliseconds
                *   @param {number}  step           - Step of measurements
                *   @param {number}  updateinterval - Update every updateInterval miliseconds
                *   @param {boolean} enableUpdates  - Enable/Disable updates
                */
                create : function(arguments){

                    this.reset();

                    var self             = this;
                    var controller       = Mist.monitoringController;

                    this.step            = arguments.step;
                    this.timeWindow      = arguments.timeWindow;
                    this.updateInterval  = arguments.updateInterval;
                    this.machine         = arguments.machine;
                    this.updateData      = arguments.updatesEnabled;
                    this.step            = arguments.step;
                    this.callback        = ('callback' in arguments) ? arguments.callback : null;
                    this.timeGap         = arguments.timeGap; // Temporary Fix , Give some time to server to collect data

                    // Calculate Start And Stop
                    this.timeStop        = Math.floor( ( (new Date()).getTime() - this.timeGap * 1000) / 1000 );

                    // Align time to be a multiply of 10
                    var secToRemove =(new Date(this.timeStop*1000)).getSeconds() % 10;
                    this.timeStop -= secToRemove;

                    this.timeStart       = Math.floor(this.timeStop - this.timeWindow/1000);
                    this.lastMetrictime  = new Date(this.timeStart*1000);
                },


                /**
                *
                *   Starts the request. User create() first
                *
                */
                start : function(){

                    var self = this;

                    this.locked = true;

                    // If request stopped Re-calculate start and stop
                    if(this.initialized && !this.running){

                        this.timeStart = Math.floor( this.lastMetrictime.getTime() /1000 ) ;
                        this.timeStop  =  Math.floor( ((new Date()).getTime() - this.timeGap * 1000 ) / 1000 );

                        // Fix time when lossing precision
                        var stopRemainder = (this.timeStop - this.timeStart) % (this.step/1000);
                        this.timeStop     = this.timeStop - stopRemainder;
                    } else {

                        this.initialized = true;
                    }

                    // Show Fetching Message On Initial Request
                    this.machine.set('pendingStats', true);

                    // Do the ajax call
                    this.requestID++;
                    this.receiveData(this.timeStart, this.timeStop, this.step,this.callback);


                    // Check if Data Updates Are Enabled
                    if(this.updateData && !this.running){
                        window.monitoringInterval = window.setInterval(function() {

                            // Stop updates if updateData is set to false
                            if(!self.updateData)
                                window.clearInterval(window.monitoringInterval);

                            // Lock request so no other request can be done in the same time
                            self.locked = true;

                            // Calculate Start and Stop
                            self.timeStart = Math.floor( self.lastMetrictime.getTime() /1000 ) ;
                            self.timeStop  =  Math.floor( ((new Date()).getTime() - self.timeGap * 1000 ) / 1000 );

                            // Fix time when lossing precision
                            var stopRemainder = (self.timeStop - self.timeStart) % (self.step/1000);
                            self.timeStop     = self.timeStop - stopRemainder;

                            // Do the ajax call
                            this.requestID++;
                            self.receiveData(self.timeStart, self.timeStop, self.step,self.callback);

                        },this.step);
                    }

                    this.running = true;

                    return this.requestID;
                },


                /**
                *
                *   Stops current request
                *
                */
                stop : function(){

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

                           reason = (typeof reason == 'undefined' ? 'manualReload' : reason);

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
                custom : function(options){

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

                            if(options){
                                if ('stop' in options){
                                    stop  = Math.floor(options.stop);
                                    start = Math.floor( stop - timeWindow/1000 );
                                }

                                if ('step' in options)
                                    step = options.step;

                                if ('timeWindow' in options)
                                    timeWindowSize = options.timeWindow;

                                if('callback' in options)
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
                customReset : function(){
                    Mist.monitoringController.graphs.enableAnimation();
                    this.reload('customRequestReset');
                },


                /**
                *
                *   Changes current request step
                *   @param {number}  newStep     - The new step
                *   @param {boolean} reloadAfter - Change Step And Reload, Default: true
                */
                changeStep: function(newStep,reloadAfter){
                    this.step = newStep;
                    reload = (typeof reloadAfter == 'undefined' ? true : reloadAfter);
                    if(reload)
                        this.reload('stepChanged');
                },


                /**
                *
                *   Changes current time window
                *   @param {number} newTimeWindow - The new timeWindow
                *   @param {boolean} reloadAfter - Change timeWindow And Reload, Default: true
                */
                changeTimeWindow: function(newTimeWindow,reloadAfter){
                    this.timeWindow = newTimeWindow;
                    reload = (typeof reloadAfter == 'undefined' ? true : reloadAfter);
                    if(reload)
                        this.reload('timeWindowChanged');
                },


                /**
                *
                *   Enables Updates , Also Animation
                *
                */
                enableUpdates: function(reloadAfter){
                    reload = (typeof reloadAfter == 'undefined' ? true : reloadAfter);
                    this.updateData = true;
                    if(reload)
                        this.reload('updatesEnabled');
                },


                /**
                *
                *   Disables Updates , Also Animation
                *
                */
                disableUpdates: function(reloadAfter){
                    reload = (typeof reloadAfter == 'undefined' ? true : reloadAfter);
                    this.updateData = false;
                    if(reload)
                        this.reload('updatesDisabled');
                }.observes("machine.isDestroying"),


                /**
                *
                *   Stops data updates by clearing the interval
                *
                */
                stopDataUpdates: function(){
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
                receiveData: function(start,stop,step,callback){

                    var requestID  = this.requestID;
                    var controller = Mist.monitoringController;
                    var self = this;

                    // Set an empty function for null callbacks
                    if (callback == null) {
                      callback = function(){};
                    }

                    $.ajax({
                        url: '/backends/' + self.machine.backend.id +
                             '/machines/' + self.machine.id + '/stats',
                        type: 'GET',
                        async: true,
                        dataType: 'json',
                        data: { 'start': start,
                                'stop': stop,
                                'step': step/1000
                              },
                        timeout: 8000,
                        success: function (data, status, xhr){

                            try {

                                if(data.load.length == 0)
                                    throw "No Data Received";

                                // TODO: Maybe there is a better to tell if
                                // we have data
                                data.load.some(function(tuple) {
                                    if (tuple[1] != null) {
                                        self.machine.set('pendingFirstData', false);
                                        return true;
                                    }
                                });

                                var disks = [];
                                var netInterfaces = [];

                                // Get Disks Names
                                for(disk in data.disk.read)
                                {
                                    disks.push(disk);
                                }

                                // Get Network Interfaces Names
                                for(netInterface in data.network)
                                {
                                     netInterfaces.push(netInterface);
                                }


                                var receivedData = {
                                    cpuCores:   0,
                                    cpu:       [],
                                    load:      [],
                                    memory:    [],
                                    diskRead:  [],
                                    diskWrite: [],
                                    networkRX: [],
                                    networkTX: []
                                };


                                // Set CPU Cores
                                receivedData.cpuCores = data.cpu.cores

                                // Create time-value objects to be used with d3
                                data.cpu.utilization.forEach(function(item) {
                                    var cpuObj = {
                                        time: new Date(item[0]*1000),
                                        value: item[1]
                                    };
                                    receivedData.cpu.push(cpuObj);
                                });

                                data.load.forEach(function(item) {
                                    var loadObj = {
                                        time : new Date(item[0]*1000),
                                        value : item[1]
                                    };
                                    receivedData.load.push(loadObj);
                                });

                                data.memory.forEach(function(item) {
                                    var memoryObj = {
                                        time : new Date(item[0]*1000),
                                        value : item[1]
                                    };
                                    receivedData.memory.push(memoryObj);
                                });

                                data.disk.read[disks[0]].disk_octets.forEach(function(item) {
                                    var diskReadObj = {
                                        time : new Date(item[0]*1000),
                                        value : item[1]
                                    };
                                    receivedData.diskRead.push(diskReadObj);
                                });

                                data.disk.write[disks[0]].disk_octets.forEach(function(item) {
                                    var diskWriteObj = {
                                        time : new Date(item[0]*1000),
                                        value : item[1]
                                    };
                                    receivedData.diskWrite.push(diskWriteObj);
                                });

                                data.network[netInterfaces[0]].rx.forEach(function(item) {
                                    var networkRxObj = {
                                        time : new Date(item[0]*1000),
                                        value : item[1]
                                    };
                                    receivedData.networkRX.push(networkRxObj);
                                });

                               data.network[netInterfaces[0]].tx.forEach(function(item) {
                                    var networkTxObj = {
                                        time : new Date(item[0]*1000),
                                        value : item[1]
                                    };
                                    receivedData.networkTX.push(networkTxObj);
                                });

                                self.lastMetrictime = receivedData.load[receivedData.load.length-1].time;

                                callback({
                                    status: 'success',
                                    data  : receivedData
                                });

                                $(document).trigger('finishedFetching',[requestID,'success']);
                            }
                            catch(err) {
                                error(err);

                                callback({
                                    status: 'error',
                                    error: err
                                });

                                $(document).trigger('finishedFetching',[requestID,'failure']);
                            }

                            self.machine.set('pendingStats', false);
                            self.locked = false;
                        },
                        error: function(jqXHR, textStatus, errorThrown) {

                            if(errorThrown == 'timeout'){

                                // When monitoring is disabled ajax call may be still run one time.
                                // So we won't display error if it is disabled
                                if(self.machine.hasMonitoring){
                                    Mist.notificationController.timeNotify("Data request timed out. " +
                                                                           "Network connection is down or server doesn't respond",4000);
                                }
                            }
                            else{

                                error(textStatus);
                            };

                            callback({
                                status: 'error',
                                error: errorThrown
                            });
                            $(document).trigger('finishedFetching',[requestID,'failure']);

                            self.machine.set('pendingStats', false);
                            self.locked = false;
                        }
                    });
                },


                /**
                *
                *   Prints some debug information
                *
                */
                printInfo: function(){
                    console.log("Time Window    : " + (this.timeWindow/1000) + " seconds");
                    console.log("Last Metric    : " + this.lastMetrictime);
                    console.log("Start          : " + (new Date(this.timeStart*1000)));
                    console.log("Stop           : " + (new Date(this.timeStop *1000)));
                    console.log("Step           : " + (this.step/1000) + " seconds");
                    console.log("Update Interval: " + this.updateInterval)
                },


                /**
                *
                *   Resets current object into the default state
                *
                */
                reset: function(){
                    this.machine        = null;
                    this.lastMetrictime = null;
                    this.callback       = null;
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

            },


            /**
            *
            *   Main object for user actions
            *   Template calls these functions
            *
            */
            UI : {
                collapsePressed : function(graph){
                    Mist.monitoringController.graphs.collapse([graph]);
                },

                expandPressed : function(graph){
                    Mist.monitoringController.graphs.expand([graph]);
                },

                zoomChange : function(){


                    var zoomIndex = $('#zoomSelect :selected').val();

                    Mist.monitoringController.zoom.toIndex(zoomIndex);

                }
            },


            /**
            *
            *   Controlls all graphs,
            *   It has instances of graphs past by the view
            */
            graphs : {


                /**
                *
                *   Enable animation of all graphs
                *
                */
                enableAnimation  : function() {
                    for(metric in this.instances)
                    {
                        this.instances[metric].enableAnimation();
                    }

                    this.animationEnabled = true;
                },


                /**
                *
                *   Disable animation of all graphs
                *   @param {boolean} stopCurrent - Stop current animation or Stop animation on next update
                */
                disableAnimation : function(stopCurrent) {

                    // Default StopCurrent true
                    stopCurrent = (typeof stopCurrent == 'undefined') ? true : stopCurrent ;

                    for(metric in this.instances)
                    {
                        this.instances[metric].disableAnimation(stopCurrent);
                    }

                    this.animationEnabled = false;
                },

                /**
                *
                *   Change time window
                *   @param {number} newTimeWindow - The new time window in miliseconds
                */
                changeTimeWindow : function(newTimeWindow) {

                    for(metric in this.instances)
                    {
                        this.instances[metric].changeTimeWindow(newTimeWindow);
                    }
                },


                /**
                *
                *  Updates graphs data
                *   @param {object} data - Metrics objects in associative array
                */
                updateData : function(data){

                    // TODO something with cpuCores property

                    // Run before queued actions
                    var numOfActions = this.updateActions.before.length;
                    for(var i=0; i<numOfActions; i++){

                        var action = this.updateActions.before.shift();
                        action();
                    }

                    // Deleting cpuCores as it is not a metric
                    delete data.cpuCores;

                    // Updating
                    for(metric in data){
                        this.instances[metric].updateData(data[metric]);
                    }


                    // Run after queued actions
                    var numOfActions = this.updateActions.after.length;
                    for(var i=0; i<numOfActions; i++){

                        var action = this.updateActions.after.shift();
                        action();
                    }
                },


                /**
                *
                *   Clears all data from graphs
                *
                */
                clearData  : function() {

                    for(metric in this.instances)
                    {
                        this.instances[metric].clearData();
                    }
                },


                /**
                *
                *  Collapse selected metrics
                *  Possible to set animation duration
                */
                collapse : function(metrics,duration) {

                    // Mobile Hide Animation is slow, disabling animation
                    var hideDuration = (typeof duration == 'undefined') ? 400 : duration;
                    if (Mist.isClientMobile) {

                        hideDuration = 0;
                    }

                    // Add graph to the end of the list
                    metrics.forEach(function(metric){

                        $("#" + metric + 'GraphBtn').insertAfter($('.graphBtn').last());

                        // Hide the Graphs
                        $("#" + metric + "Graph").hide(hideDuration,function(){

                            // Show Graphs Buttons
                            $("#" + metric + 'GraphBtn').show(0, function(){

                                // Set Cookie
                                var graphBtns = [];
                                $('.graphBtn').toArray().forEach(function(entry){
                                    if($(entry).css('display') != 'none')
                                        graphBtns.push($(entry).attr('id').replace('GraphBtn','').replace('#',''));
                                });

                                Mist.monitoringController.cookies.setCollapsedMetrics(graphBtns);
                            });
                        });
                    });

                },


                /**
                *
                *  Expands selected metrics
                *  Possible to set animation duration
                */
                expand : function(metrics,duration) {

                    // Mobile Hide Animation is slow, disabling animation
                    var hideDuration = (typeof duration == 'undefined') ? 400 : duration;
                    if (Mist.isClientMobile) {

                        hideDuration = 0;
                    }

                    // Add graph to the end of the list
                    metrics.forEach(function(metric){

                        $("#" + metric + 'Graph').insertAfter($('.graph').last());

                        // Hide the buttons
                        $("#" + metric + "GraphBtn").hide(0);

                        // Show Graphs
                        $("#" + metric + 'Graph').show(hideDuration, function(){

                            // Set Cookie
                            var graphBtns = [];
                            $('.graphBtn').toArray().forEach(function(entry){
                                if($(entry).css('display') != 'none')
                                    graphBtns.push($(entry).attr('id').replace('GraphBtn','').replace('#',''));
                            });

                            Mist.monitoringController.cookies.setCollapsedMetrics(graphBtns);

                        });
                    });

                },

                /*
                * add a function to be called before or after updating graphs
                * @param {string}   when   - Posible values 'before' or 'after' (updating)
                * @param {function} action - The function that will run before or after updating
                */
                addNextUpdateAction: function(when,action){

                    if(when == 'before')
                        this.updateActions.before.push(action);
                    else
                        this.updateActions.after.push(action);
                },

                /*
                *
                *  Remove all actions from queue
                */
                clearNextUpdateActions: function(){
                    this.updateActions.before = [];
                    this.updateActions.after  = [];
                },

                /**
                *
                *  Resets current object to the default state
                *
                */
                reset: function() {
                    this.instances        = null;
                    this.animationEnabled = true;
                    this.updateActions    = {
                        before : [],
                        after  : []
                    };
                },

                instances        : null,    // Graph Objects created by the view
                animationEnabled : true,
                updateActions    : {
                    before : [],
                    after  : []
                }
            },


            /**
            *
            *   Controls for cookies in monitoring
            *
            */
            cookies : {


                /**
                *
                *  Returns collapsed metrics retrieved for cookies
                *
                */
                getCollapsedMetrics : function(){

                    if(document.cookie.indexOf("collapsedGraphs")  == -1)
                        return null

                    var cookieValue     = "";
                    var collapsedGraphs = [];

                    // Get Graph List Cookie
                    var parts = document.cookie.split("collapsedGraphs=");
                    if (parts.length == 2)
                        cookieValue = parts.pop().split(";").shift();

                    if(cookieValue.length > 0){

                        // Create Array Of IDs
                        collapsedGraphs = cookieValue.split('|');
                    }


                    return collapsedGraphs;
                },


                /**
                *
                *  Write collapsed metrics to cookies
                *  @param {array} metrics - Metric names
                */
                setCollapsedMetrics : function(metrics){

                    var graphBtnIdList  = [];
                    var collapsedGraphs = [];
                    var cookieExpire    = new Date();
                    cookieExpire.setFullYear(cookieExpire.getFullYear() + 2);


                    document.cookie = "collapsedGraphs=" + metrics.join('|') + "; " +
                                      "expires=" + cookieExpire.toUTCString() +"; " +
                                      "path=/";
                },


                getCurrentTimeWindow: function(){
                    if(document.cookie.indexOf("collapsedGraphs")  == -1) {
                        console.log("No Time Window saved");
                        return null
                    }
                },

                setCurrentTimeWindow: function(zoomIndex){

                }
            },


            /*
            *
            *   Zoom Feature, Make time window bigger or smaller
            *
            */
            zoom : {

                in  : function(){
                    if(this.zoomIndex > 0){
                        this.zoomIndex--;
                        this.to(this.zoomValues[this.zoomIndex].value * 60000); // (60*1000)
                    }
                },
                out : function(){

                    if(this.zoomIndex < this.zoomValues.length-1){
                        this.zoomIndex++;
                        this.to(this.zoomValues[this.zoomIndex].value * 60000); // (60*1000)
                    }
                },
                toIndex : function(zoomIndex){

                    if(zoomIndex != this.zoomIndex) {

                        this.prevZoomIndex = this.zoomIndex
                        this.zoomIndex     = zoomIndex;
                        this.to(this.zoomValues[zoomIndex].value * 60000,'to'); // (60*1000)
                    }
                },
                // direction is optional, used for in and out
                to  : function(timeWindow,direction){

                    var controller = Mist.monitoringController;
                    var self = this;
                    direction = (typeof direction == 'undefined' ? null : direction);

                    var zoom = function(){

                        // Check if request is pending
                        if (controller.request.locked){

                            window.setTimeout(zoom,1000);
                        }
                        else{

                            var changeTimeWindow = function(){
                                controller.graphs.changeTimeWindow(timeWindow);
                            }

                            controller.graphs.addNextUpdateAction('before',changeTimeWindow);


                            var measurements = 60;
                            timeWindowInMinutes = timeWindow /60000;
                            newStep = Math.round( (timeWindowInMinutes*60 / measurements)*1000 );
                            controller.request.changeStep(newStep,false);
                            controller.request.changeTimeWindow(timeWindow,false);

                            // When we have more than 10 minutes time window we don't really need updates
                            if(timeWindowInMinutes > 10)
                                controller.request.disableUpdates(false);
                            else
                                controller.request.enableUpdates(false);

                            var zoomID = controller.request.reload();

                            $(document).one('finishedFetching',function(event,requestID,status){

                                if(zoomID==requestID)
                                    self.enable();
                                if(status!='success'){

                                    // Revert Index
                                    if(direction == 'in')
                                        self.zoomIndex++;
                                    else if(direction =='out')
                                        self.zoomIndex--;
                                    else if(direction == 'to')
                                        self.zoomIndex = self.prevZoomIndex;

                                    self.setZoomUI(self.zoomIndex);
                                }

                                self.enable();
                                Mist.monitoringController.history.enableControls();
                            })
                        }
                    };


                    controller.request.stop();

                    // Show pending stats popup before data request because if previous request
                    // takes place because this feature may appear as broken
                    Mist.monitoringController.request.machine.set('pendingStats', true);
                    // Disable change time window button
                    this.disable();
                    // Temporary Disable History Controls
                    Mist.monitoringController.history.disableControls();
                    zoom();
                },



                setZoomUI : function(index){

                    document.getElementById('zoomSelect').options[this.zoomIndex].selected = 'selected';
                    $('#zoomSelect-button').find("span").text($('#zoomSelect').find(":selected").text());
                },

                disable: function(){

                    $('#zoomSelect-button *').addClass('ui-disabled');
                },

                enable: function(){

                    $('#zoomSelect-button *').removeClass('ui-disabled');
                },

                reset: function(){

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
            },


            /**
            *
            *   History feature, get previous graph data and display them
            *
            */
            history : {


                /**
                *
                *  Go a timewindow back,
                *  Also enables history if not enabled
                */
                goBack: function() {

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    // When we enable history we must get last measurement and time window
                    if(!this.isEnabled) {
                        this.enable();
                    }
                    else {
                        this.currentStopTime = new Date(this.currentStopTime - this.timeWindow);

                    }


                    request.custom({
                        stop     : (+this.currentStopTime / 1000),
                        callback : function(result){
                            // On error set currentStop where it was
                            if(result.status == 'success')
                                Mist.monitoringController.graphs.updateData(result.data);
                            else{
                                self.currentStopTime = new Date(+self.currentStopTime + self.timeWindow);
                                if(self.currentStopTime.getTime() == self.lastMetrictime.getTime()){
                                    self.disable();
                                }
                            }
                        }
                    });

                },


                /**
                *
                *   Go a timewindow forward
                *   Also disables history if it is in the last history block
                */
                goForward: function() {

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    if(this.isEnabled) {

                        this.currentStopTime = new Date(+this.currentStopTime + this.timeWindow);

                        // If Next Block of time is ahead of last Metric Disable Monitoring
                        if( (+this.currentStopTime) > (+this.lastMetrictime) ) {

                            this.disable();
                        }
                        else{

                            request.custom({
                                stop     : (+this.currentStopTime / 1000),
                                callback : function(result){
                                    // On error set currentStop where it was
                                    if(result.status == 'success')
                                        Mist.monitoringController.graphs.updateData(result.data);
                                    else
                                        self.currentStopTime = new Date(+self.currentStopTime - self.timeWindow);
                                }
                            });
                        }
                    }

                },


                /**
                *
                *   Enable history feature
                *
                */
                enable : function() {

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    if(!this.isEnabled) {

                        this.isEnabled       = true;
                        this.timeWindow      = request.timeWindow;
                        this.lastMetrictime  = request.lastMetrictime;
                        this.currentStopTime =  new Date(this.lastMetrictime.getTime() - this.timeWindow);

                        $('#graphsGoForward').removeClass('ui-disabled');
                        $('#graphsResetHistory').removeClass('ui-disabled');

                        Mist.monitoringController.zoom.disable();
                    }
                },


                /**
                *
                *  Disable History Feature
                *
                */
                disable: function() {
                    this.isEnabled = false;
                    Mist.monitoringController.request.customReset();

                    $('#graphsGoForward').addClass('ui-disabled');
                    $('#graphsResetHistory').addClass('ui-disabled');

                    Mist.monitoringController.zoom.enable();
                },

                disableControls: function() {
                    $('#graphsGoBack').addClass('ui-disabled');
                    $('#graphsGoForward').addClass('ui-disabled');
                    $('#graphsResetHistory').addClass('ui-disabled');
                },

                enableControls: function() {
                    $('#graphsGoBack').removeClass('ui-disabled');
                    if(this.isEnabled){
                        $('#graphsGoForward').removeClass('ui-disabled');
                        $('#graphsResetHistory').removeClass('ui-disabled');
                    }
                },

                /**
                *
                *   Resets history object to the default state
                *
                */
                reset: function() {
                    this.isEnabled       = false;
                    this.lastMetrictime  = null;
                    this.timeWindow      = 0;
                    this.currentStopTime = null;
                },

                isEnabled       : false,
                lastMetrictime  : null,
                timeWindow      : 0,
                currentStopTime : null
            }

        })
    }
);
