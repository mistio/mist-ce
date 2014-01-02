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

            /* Events Triggered By Controller
            *  - reloading          (No Arguments)
            *  - dataFetchStarted   (No Arguments)
            *  - dataFetchFinished  (Success_Bool,Data)
            */
            
            machineNotResponding: false,

            // TODO , Remove Machine And View Arguments
            // TODO , UpdateInterval And Step Must Be the Same
            initialize: function(machine,timeWindow,step,updateInterval,enableUpdates){
                //this.machine = machine;
                this.request.initiliaze(timeWindow,step,machine,updateInterval,enableUpdates);
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
                    controller.one('dataFetchFinished',function() {
                        machine.set('pendingStats', false);
                    });

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

                    this.receiveData(start, stop, self.step);


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

                            self.receiveData(start, stop, self.step);
                        },updateInterval);
                    }
                },

                // Posible options, Stop,Step,Timewindow
                custom : function(options){

                    var timeGap          = 60;
                    var timeWindow       = this.timeWindow;
                    var step             = this.step;
                    var stop             = Math.floor( ( (new Date()).getTime() - timeGap * 1000) / 1000 );
                    var start            = Math.floor( stop - timeWindow/1000 );


                    if(options){
                        if ('stop' in options){
                            stop  = Math.floor(options['stop'] - timeGap);
                            start = Math.floor( stop - timeWindow/1000 );
                        }
                        
                        if ('step' in options)
                            step = options['step'];
                        
                        if ('timeWindow' in options)
                            timeWindowSize = options['timeWindow'];
                    }


                    this.machine.set('pendingStats', true);
                    Mist.monitoringController.one('dataFetchFinished',function() {
                        Mist.monitoringController.request.machine.set('pendingStats', false);
                    });


                    this.receiveData(start, stop, step);



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

                           Mist.monitoringController.trigger('reloading',reason);

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
                receiveData: function(start,stop,step){

                    var controller = Mist.monitoringController;
                    var self = this;

                    controller.trigger("dataFetchStarted");

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

                                self.machine.set('pendingStats', false);
                                self.lastMetrictime = new Date(metricTime.getTime()-10000);
                                // Send Data via Event
                                controller.trigger("dataFetchFinished",true,receivedData);
                            }
                            catch(err) {
                                error(err);
                                controller.machineNotResponding = true;
                                controller.trigger("dataFetchFinished",false);
                            }

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

                            controller.trigger("dataFetchFinished",false);
                        }
                    });
                },

                printInfo: function(){
                    console.log("Time Window    : " + (this.timeWindow/1000) + " seconds");
                    console.log("Last Metric    : " + this.lastMetrictime);
                    console.log("Step           : " + (this.step/1000) + " seconds");
                    console.log("Update Interval: " + this.updateInterval)
                }, 

                // Private Variables
                machine        : null,
                lastMetrictime : null,
                timeWindow     : 0,
                step           : 0,
                updateData     : false,
                updateInterval : 0,
                locked         : false

            },

            // TODO Remove These Functions When They Are Not Needed
            updateDataRequest: function(timeToRequestms,step){
                window.clearInterval(window.monitoringInterval);
                this.setupDataRequest(timeToRequestms,step);
            },

            /* Demo History Feature */
            historyController : {
                goBack: function(){

                },
                goForward: function(){

                },

                currentStopTime: null
            }

        })
    }
);
