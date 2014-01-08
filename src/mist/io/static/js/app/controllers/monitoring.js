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
            
            machineNotResponding: false,

            // TODO , Remove Machine And View Arguments
            // TODO , UpdateInterval And Step Must Be the Same
            initialize: function(arguments){

                // Reset All Controller Values
                this.reset();

                this.request.initiliaze(arguments['timeWindow'],
                                        arguments['step'], 
                                        arguments['machineModel'],
                                        arguments['updatesInterval'],
                                        arguments['updatesEnabled']);

                this.graphs.instances = arguments['graphs'];
            },

            // Todo add Description
            reset: function(){

                this.request.reset();
                this.history.reset();
                this.graphs.reset();
            },

            /**
            *   Request Object
            *   This object is responsible for data requests
            *
            */
            request: {

                /**
                *   Initialize function
                *   timeWindow     : integer in microseconds
                *   step           : integer in microseconds
                *   updateinterval : integer in microseconds
                *   enableUpdates  : boolean
                */
                initiliaze : function(timeWindow,step,machine,updateInterval,enableUpdates){


                    var self = this;
                    var controller = Mist.monitoringController;
                    var timeGap = 60;

                    this.locked = true;
                    this.step = step;
                    this.timeWindow = timeWindow;
                    this.updateInterval = updateInterval;
                    this.machine = machine;
                    // Enable/Disable Updates
                    this.updateData = enableUpdates;

                    // Show Fetching Message On Initial Request
                    self.machine.set('pendingStats', true);

                    // Note: Converting ms To s for start and stop, step remains ms
                    var stop  = Math.floor( ( (new Date()).getTime() - timeGap * 1000) / 1000 );
                    var start = Math.floor(stop - timeWindow/1000);
                    self.step = step;

                    // Last measurement must be the first measurement
                    self.lastMetrictime = new Date(start);

                    /* Request Debugging : TODO Remove It when requests are stable
                    console.log("Request Time:");
                    console.log("Start: " + (new Date(start*1000)));
                    console.log("Stop : " + (new Date(stop*1000)));
                    console.log("");
                    */

                    this.receiveData(start, stop, self.step,null);


                    // Check if Data Updates Are Enabled
                    if(this.updateData){
                        window.monitoringInterval = window.setInterval(function() {
                            self.locked = true;
                            var start = Math.floor( self.lastMetrictime.getTime() /1000 ) ;
                            var stop =  Math.floor( ((new Date()).getTime() - timeGap * 1000 ) / 1000 );
                            var stopRemainder = (stop - start) % (self.step/1000);
                            stop = stop - stopRemainder;

                            /* Request Debugging : TODO Remove It when requests are stable
                            if(stopRemainder>0)
                                error("Loss Of Presition: " + stopRemainder);

                            console.log("Request Time:");
                            console.log("Start: " + new Date(start*1000));
                            console.log("Stop : " + new Date(stop *1000 ));
                            console.log("");
                            */
                            controller.machineNotResponding = false;

                            self.receiveData(start, stop, self.step,null);
                        },updateInterval);
                    }
                },

                // Posible options, Stop,Step,Timewindow
                custom : function(options){

                    // Clear Intervals
                    this.stopDataUpdates();

                    // Wait Until Requests are not locked
                    var self   = this;
                    var custom = function(){

                        if(self.locked){
                            console.log("Waiting For Action To Finish");
                            window.setTimeout(custom,1000);
                        }
                        else{
                            //var timeGap          = 60;
                            var timeWindow       = self.timeWindow;
                            var step             = self.step;
                            var stop             = Math.floor( ( new Date()).getTime() / 1000 ); //Math.floor( ( (new Date()).getTime() - timeGap * 1000) / 1000 );
                            var start            = Math.floor( stop - timeWindow/1000 );
                            var callback         = null;

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

                // Possible Temporary Function TODO check this
                customReset : function(){
                    Mist.monitoringController.graphs.enableAnimation();
                    this.reload('customRequestReset');
                },

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
                *   reason : Values(manualReload,updatesDisabled,updatesEnabled)
                */
                reload: function(reason){

                    var self = this;

                    var reload = function(){

                        if(self.locked){
                            console.log("Waiting For Action To Finish");
                            window.setTimeout(reload,1000);
                        }
                        else{
                            console.log("reloading");
                           // Clear Intervals 
                           self.stopDataUpdates();

                           reason = (typeof reason == 'undefined' ? 'manualReload' : reason);

                           // Temporary Fix For Some Functions TODO change this
                           if(reason == 'updatesDisabled')
                                Mist.monitoringController.graphs.disableAnimation(false);
                           if(reason == 'updatesEnabled')
                                Mist.monitoringController.graphs.enableAnimation();

                            Mist.monitoringController.graphs.clearData();
                            // End Of Fix

                           // Re-Initialize Request
                           self.initiliaze(self.timeWindow,self.step,self.machine,self.updateInterval,self.updateData); 
                        }

                    };

                    reload();
                },


                // Private functions
                stopDataUpdates: function(){
                    window.clearInterval(window.monitoringInterval);
                },
                receiveData: function(start,stop,step,callback){

                    var controller = Mist.monitoringController;
                    var self = this;

                    // Set an empty function for null callbacks
                    if (callback == null) {
                      callback = function(){};
                    }

                    // start: date/time we want to receive data from (seconds)
                    // stop:  date/time we want to receeive data until (seconds)
                    // step:  miliseconds we want to split data
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
                                controller.graphs.updateData(receivedData);

                                callback({
                                    status: 'success'
                                });
                            }
                            catch(err) {
                                error(err);
                                controller.machineNotResponding = true;

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

                                    controller.machineNotResponding = true;
                                }
                            }
                            else{
                                //Mist.notificationController.timeNotify("An error occurred while retrieving data",4000);
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

                printInfo: function(){
                    console.log("Time Window    : " + (this.timeWindow/1000) + " seconds");
                    console.log("Last Metric    : " + this.lastMetrictime);
                    console.log("Step           : " + (this.step/1000) + " seconds");
                    console.log("Update Interval: " + this.updateInterval)
                }, 

                reset: function(){
                    this.machine        = null;
                    this.lastMetrictime = null;  
                    this.timeWindow     = 0;     
                    this.step           = 0;     
                    this.updateData     = false; 
                    this.updateInterval = 0;     
                    this.locked         = false; 
                },
                
                machine        : null,
                lastMetrictime : null,  // Date Object
                timeWindow     : 0,     // integer in miliseconds
                step           : 0,     // integer in miliseconds
                updateData     : false, // boolean
                updateInterval : 0,     // integer in miliseconds
                locked         : false, // boolean 

            },

            // TODO Remove These Functions When They Are Not Needed
            updateDataRequest: function(timeToRequestms,step){
                window.clearInterval(window.monitoringInterval);
                this.setupDataRequest(timeToRequestms,step);
            },

            
            // Graphs Controller
            graphs : {

                enableAnimation  : function() {
                    for(metric in this.instances)
                    {
                        this.instances[metric].enableAnimation();
                    }

                    this.animationEnabled = true;
                },

                
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

                updateData : function(data){

                    // TODO something with cpuCores property
                    // Then we delete it
                    delete data['cpuCores'];
                    
                    for(metric in data){
                        this.instances[metric].updateData(data[metric]);
                    }
                },

                clearData  : function() {
                    
                    for(metric in this.instances)
                    {
                        this.instances[metric].clearData();
                    }
                },

                reset: function() {
                    this.instances        = null;
                    this.animationEnabled = true;
                },

                instances        : null,    // Graph Objects created by the view
                animationEnabled : true
            },


            /* History Feature 
            *
            *
            */
            history : {

                goBack: function() {

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    // When we enable history we must get last measurement and time window
                    if(!this.isEnabled) {

                        this.isEnabled       = true;
                        this.timeWindow      = request.timeWindow;
                        this.lastMetrictime  = request.lastMetrictime;
                        this.currentStopTime =  new Date(this.lastMetrictime.getTime() - this.timeWindow);


                        // Debug
                        /*console.log("Time Window: " + (this.timeWindow/1000/60) + " Minutes" );
                        console.log("Current Stop Time: " + this.lastMetrictime);
                        console.log("New     Stop Time: " + this.currentStopTime);
                        */

                        $('#graphsGoForward').removeClass('ui-disabled');
                        $('#graphsResetHistory').removeClass('ui-disabled');
                    }
                    else {
                        this.currentStopTime = new Date(this.currentStopTime - this.timeWindow);

                        // Debug
                        /*console.log("Time Window: " + (this.timeWindow/1000/60) + " Minutes" );
                        console.log("Last  Metric Time: " + this.lastMetrictime);
                        console.log("New     Stop Time: " + this.currentStopTime);*/
                    }


                    request.custom({
                        stop     : (+this.currentStopTime / 1000),
                        callback : function(result){
                            // On error set currentStop where it was
                            if(result['status'] != 'success'){
                                self.currentStopTime = new Date(+self.currentStopTime + self.timeWindow);
                            }
                        }
                    });

                },


                goForward: function(){

                    var self    = this;
                    var request = Mist.monitoringController.request;

                    if(this.isEnabled){

                        this.currentStopTime = new Date(+this.currentStopTime + this.timeWindow);

                        // If Next Block of time is ahead of last Metric Disable Monitoring
                        if( (+this.currentStopTime) > (+this.lastMetrictime) ) {

                            /*console.log("Disabling History");
                            console.log("Last  Metric Time: " + this.lastMetrictime);
                            console.log("New     Stop Time: " + this.currentStopTime);*/
                            this.disable();

                        }
                        else{

                            /*console.log("Time Window: " + (this.timeWindow/1000/60) + " Minutes" );
                            console.log("Last  Metric Time: " + this.lastMetrictime);
                            console.log("New     Stop Time: " + this.currentStopTime);*/
                           
                            request.custom({
                                stop     : (+this.currentStopTime / 1000),
                                callback : function(result){
                                    // On error set currentStop where it was
                                    if(result['status'] != 'success'){
                                        self.currentStopTime = new Date(+self.currentStopTime - self.timeWindow);
                                    }
                                }
                            });
                        }
                    }

                },

                disable: function(){
                    this.isEnabled = false;
                    Mist.monitoringController.request.customReset();

                    $('#graphsGoForward').addClass('ui-disabled');
                    $('#graphsResetHistory').addClass('ui-disabled');
                },

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
