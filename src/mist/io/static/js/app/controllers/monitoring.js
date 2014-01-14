define('app/controllers/monitoring', [
    'ember'
    ],
    /**
     * Monitoring Controller
     *
     * @returns Class
     */
    function() {
        return Ember.ObjectController.extend(Ember.Evented,{
            

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
                this.graphs.instances = arguments['graphs'];

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

                // Create and Start the request
                this.request.create({
                    machine         : arguments['machineModel'], // Send Current Machine
                    timeWindow      : 10*60*1000,                // Display 10 Minutes
                    step            : 10000,                     // Metrics Step in miliseconds
                    updateInterval  : 10000,                     // Get Updates Every x Miliseconds
                    updatesEnabled  : true,                      // Get Updates
                    timeGap         : 60,                        // Gap between current time and requested
                    callback        : function(result){
                        if(result['status'] == 'success'){
                            self.graphs.updateData(result['data']);
                        }
                    }
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

                    this.step            = arguments['step'];
                    this.timeWindow      = arguments['timeWindow'];
                    this.updateInterval  = arguments['updateInterval'];
                    this.machine         = arguments['machine'];
                    this.updateData      = arguments['updatesEnabled'];
                    this.step            = arguments['step'];
                    this.callback        = ('callback' in arguments) ? arguments['callback'] : null;
                    this.timeGap         = arguments['timeGap']; // Temporary Fix , Give some time to server to collect data

                    // Calculate Start And Stop
                    this.timeStop        = Math.floor( ( (new Date()).getTime() - this.timeGap * 1000) / 1000 );
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
                    this.receiveData(this.timeStart, this.timeStop, this.step,this.callback);


                    // Check if Data Updates Are Enabled
                    if(this.updateData && !this.running){
                        window.monitoringInterval = window.setInterval(function() {

                            // Lock request so no other request can be done in the same time
                            self.locked = true;

                            // Calculate Start and Stop
                            self.timeStart = Math.floor( self.lastMetrictime.getTime() /1000 ) ;
                            self.timeStop =  Math.floor( ((new Date()).getTime() - self.timeGap * 1000 ) / 1000 );

                            // Fix time when lossing precision
                            var stopRemainder = (self.timeStop - self.timeStart) % (self.step/1000);
                            self.timeStop = self.timeStop - stopRemainder;

                            // Do the ajax call
                            self.receiveData(self.timeStart, self.timeStop, self.step,self.callback);

                        },this.updateInterval);
                    }

                    this.running = true;
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

                           // Temporary Fix For Some Functions TODO change this
                           if(reason == 'updatesDisabled')
                                Mist.monitoringController.graphs.disableAnimation(false);
                           if(reason == 'updatesEnabled')
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

                           self.start();
                        }

                    };

                    reload();
                },

                /**
                *
                *   Runs a custm request without destroying the previous
                *   @param {object} options - Stop,Step,Timewindow
                */
                custom : function(options){

                    // Clear Intervals
                    this.stopDataUpdates();

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
                            var stop        = Math.floor( ( new Date()).getTime() / 1000 ); //Math.floor( ( (new Date()).getTime() - timeGap * 1000) / 1000 );
                            var start       = Math.floor( stop - timeWindow/1000 );
                            var callback    = null;

                            if(options){
                                if ('stop' in options){
                                    stop  = Math.floor(options['stop']);//Math.floor(options['stop'] - timeGap);
                                    start = Math.floor( stop - timeWindow/1000 );
                                }
                                
                                if ('step' in options)
                                    step = options['step'];
                                
                                if ('timeWindow' in options)
                                    timeWindowSize = options['timeWindow']; // TODO Check this size ?

                                if('callback' in options)
                                    callback = options['callback'];
                            }

                            self.locked = true;
                            self.machine.set('pendingStats', true);

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
                *   @param {number} newStep - The new step
                */
                changeStep: function(newStep){
                    this.step = newStep;
                    this.reload('stepChanged');
                },
                changeTimeWindow: function(){},

                enableUpdates: function(){
                    this.updateData = true;
                    this.reload('updatesEnabled');
                },
                disableUpdates: function(){
                    this.updateData = false;
                    this.reload('updatesDisabled');
                },


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
                                'step': step
                              },
                        timeout: 8000,
                        success: function (data, status, xhr){

                            try {

                                var measurmentsExpected = Math.floor((stop-start) / (step/1000)) ;

                                // Throw error for none or more measurements
                                if(data.load.length == 0)
                                    throw "Error, Received none measurements";
                                else if(data.load.length > measurmentsExpected)
                                    throw ("Error, Received more measurements than expected, " + 
                                            data.load.length + " instead of " + measurmentsExpected);

                                var disks = [];
                                var netInterfaces = [];

                                // Get Disks Names
                                for(disk in data['disk']['read'])
                                {
                                    disks.push(disk);
                                }

                                // Get Network Interfaces Names
                                for(netInterface in data['network'])
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
                                receivedData.cpuCores =  data['cpu']['cores'];

                                /* Request Debugging : TODO Remove It when requests are stable
                                console.log("Measurement Expected: " + measurmentsExpected + " For " + (stop-start) + " seconds");
                                console.log("Measurement Received: ");
                                console.log("LOAD   : " + data.load.length);
                                console.log("CPU    : " + data['cpu']['utilization'].length);
                                console.log("MEM    : " + data['memory'].length);
                                console.log("DISK R : " + data['disk']['read'][disks[0]]['disk_octets'].length);
                                console.log("DISK W : " + data['disk']['write'][disks[0]]['disk_octets'].length);
                                console.log("NET TX : " + data['network'][netInterfaces[0]]['tx'].length);
                                console.log("NET RX : " + data['network'][netInterfaces[0]]['rx'].length);
                                console.log("");
                                */

                                // Create a date with first measurement time
                                var metricTime = new Date(start*1000 + step);

                                // Create Custom Objects From Data
                                for(var i=0; i < data.load.length; i++ )
                                {

                                    var cpuObj = {
                                        time : metricTime,
                                        value: ( (data['cpu']['utilization'][i] * data['cpu']['cores']) * 100)
                                    };
                                    var loadObj = {
                                        time : metricTime,
                                        value: data['load'][i]
                                    };
                                    var memObj = {
                                        time : metricTime,
                                        value: data['memory'][i]
                                    };

                                    // TODO Add Multiple Disks
                                    var diskReadObj = {
                                        time: metricTime,
                                        value: data['disk']['read'][disks[0]]['disk_octets'][i]
                                    };
                                    var diskWriteObj = {
                                        time: metricTime,
                                        value: data['disk']['write'][disks[0]]['disk_octets'][i]
                                    };

                                    // TODO Add Multiple Interfaces
                                    var networkRXObj = {
                                        time: metricTime,
                                        value: data['network'][netInterfaces[0]]['rx'][i]
                                    };
                                    var networkTXObj = {
                                        time: metricTime,
                                        value: data['network'][netInterfaces[0]]['tx'][i]
                                    };

                                    // Push Objects Into Data Object
                                    receivedData.cpu.push(cpuObj);
                                    receivedData.load.push(loadObj);
                                    receivedData.memory.push(memObj);
                                    receivedData.diskRead.push(diskReadObj);
                                    receivedData.diskWrite.push(diskWriteObj);
                                    receivedData.networkRX.push(networkRXObj);
                                    receivedData.networkTX.push(networkTXObj);

                                    // Increase time by step for every new measurement
                                    metricTime = new Date(metricTime.getTime()+10000);
                                }

                                self.lastMetrictime = new Date(metricTime.getTime()-10000);

                                callback({
                                    status: 'success',
                                    data  : receivedData
                                });
                            }
                            catch(err) {
                                error(err);

                                callback({
                                    status: 'error',
                                    error: err
                                });
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
                },
                
                machine        : null,  // TODO Add more description in comments
                lastMetrictime : null,  // Date Object
                callback       : null,  // Function
                timeWindow     : 0,     // integer in miliseconds
                timeStart      : 0,     // integer in miliseconds - Note Currently In Seconds
                timeStop       : 0,     // integer in miliseconds - Note Currently In Seconds
                step           : 0,     // integer in miliseconds
                timeGap        : 0,     // integer in miliseconds - Note Currently In Seconds
                updateInterval : 0,     // integer in miliseconds
                updateData     : false, // boolean
                locked         : false, // boolean 
                running        : false, // boolean
                initialized    : false, // boolean

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
                    stopCurrent = (typeof stopCurrent === 'undefined') ? true : stopCurrent ;

                    if(stopCurrent) {

                        for(metric in this.instances)
                        {
                            this.instances[metric].disableAnimation();
                        }
                    }
                    else {

                        for(metric in this.instances)
                        {
                            this.instances[metric].disableNextAnimation();
                        }
                    }

                    this.animationEnabled = false;
                },

                /**
                *
                *  Updates graphs data
                *   @param {object} data - Metrics objects in associative array
                */
                updateData : function(data){

                    // TODO something with cpuCores property

                    // Then we delete it
                    delete data['cpuCores'];
                    
                    for(metric in data){
                        this.instances[metric].updateData(data[metric]);
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

                /**
                *
                *  Resets current object to the default state
                *  
                */
                reset: function() {
                    this.instances        = null;
                    this.animationEnabled = true;
                },

                instances        : null,    // Graph Objects created by the view
                animationEnabled : true
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
                }
            },


            /* Zoom Feature 
            *
            *

            Zoom : {
                in  : function(){},
                out : function(){},
                to  : function(){},
            },*/


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
                            if(result['status'] == 'success')
                                Mist.monitoringController.graphs.updateData(result['data']);
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
                                    if(result['status'] == 'success')
                                        Mist.monitoringController.graphs.updateData(result['data']);
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
