define('app/controllers/monitoring', [
    'ember'
    ],
    /**
     * Monitoring Controller
     *
     * @returns Class
     */
    function() {
        return Ember.ObjectController.extend({

            machine : null,
            machineNotResponding: false,
            lastMeasurmentTime: null,
            view: null,

            step: 0,

            // This one is called from view
            initController: function(machine,view){
                this.machine = machine;
                this.view = view;
            },

            /**
            * Method: setupDataRequest
            * Receives first data and set time interval for
            * next reuqests
            */
            setupDataRequest: function(timeToRequestms,step){

                var SECONDS_INTERVAL = 10000;

                var self = this;
                var timeGap = 60;


                // First Data Request
                self.machine.set('pendingStats', true);

                // Note: Converting ms To s for start and stop, step remains ms
                var stop  = Math.floor( ( (new Date()).getTime() - timeGap * 1000) / 1000 );
                var start = Math.floor(stop - timeToRequestms/1000);
                self.step = step;

                // Last measurement must be the first measurement
                self.lastMeasurmentTime = new Date(start);

                /* Request Debugging : TODO Remove It when requests are stable
                console.log("Request Time:");
                console.log("Start: " + (new Date(start*1000)));
                console.log("Stop : " + (new Date(stop*1000)));
                console.log("");
                */

                self.receiveData(start, stop, self.step);
                

                // Update Request Every SECONDS_INTERVAL miliseconds
                window.monitoringInterval = window.setInterval(function() {

                    var start = Math.floor( self.lastMeasurmentTime.getTime() /1000 ) ;
                    var stop =  Math.floor( ((new Date()).getTime() - timeGap * 1000 ) / 1000 );
                    var stopRemainder = (stop - start) % (step/1000);
                    stop = stop - stopRemainder;

                    /* Request Debugging : TODO Remove It when requests are stable
                    if(stopRemainder>0)
                        error("Loss Of Presition: " + stopRemainder);

                    console.log("Request Time:");
                    console.log("Last Mes: " + self.lastMeasurmentTime);
                    console.log("Start: " + new Date(start*1000));
                    console.log("Stop : " + new Date(stop *1000 ));
                    console.log("");
                    */
                    machineNotResponding = false;

                    self.receiveData(start, stop, self.step);

                },SECONDS_INTERVAL);
            },

            updateDataRequest: function(timeToRequestms,step){
                window.clearInterval(window.monitoringInterval);
                this.setupDataRequest(timeToRequestms,step);
            },

            finishedGraphUpdate: function(){
                // Runs After All Graphs Are Updated
                // Do Some Stuff Here
            },


            /**
            * Method: receiveData
            * Makes an ajax request to served, receives measurements
            * creates custom data objects and updates graphs
            */
            receiveData: function(start,stop,step){

                var self = this;

                // start: date/time we want to receive data from (seconds)
                // stop:  date/time we want to receeive data until (seconds)
                // step:  miliseconds we want to split data
                $.ajax({
                    url: '/backends/' + this.machine.backend.id +
                         '/machines/' + this.machine.id + '/stats',
                    type: 'GET',
                    async: true,
                    dataType: 'json',
                    data: { 'start': start, 
                            'stop': stop,
                            'step': step
                          },
                    timeout: 8000,
                    success: function (data, status, xhr){

                        var controller = Mist.monitoringController;

                        try {

                            var measurmentsExpected = Math.floor((stop-start) / (step/1000)) ;

                            if(data.load.length == 0)
                                throw "Error, Received none measurements";
                            else if(data.load.length > measurmentsExpected)
                                throw "Error, Received more measurements than expected";

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
                                netRX:     [],
                                netTX:     []
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
                                var netRXObj = {
                                    time: metricTime,
                                    value: data['network'][netInterfaces[0]]['rx'][i]
                                };
                                var netTXObj = {
                                    time: metricTime,
                                    value: data['network'][netInterfaces[0]]['tx'][i]
                                };

                                // Push Objects Into Data Object
                                receivedData.cpu.push(cpuObj);
                                receivedData.load.push(loadObj);
                                receivedData.memory.push(memObj);
                                receivedData.diskRead.push(diskReadObj);
                                receivedData.diskWrite.push(diskWriteObj);
                                receivedData.netRX.push(netRXObj);
                                receivedData.netTX.push(netTXObj);

                                // Increase time by step for every new measurement
                                metricTime = new Date(metricTime.getTime()+10000);
                            }

                            controller.machine.set('pendingStats', false);
                            self.lastMeasurmentTime = new Date(metricTime.getTime()-10000);
                            self.view.updateGraphs(receivedData);
                            self.finishedGraphUpdate();
                        }
                        catch(err) {
                            error(err);
                            self.machineNotResponding = true;
                        }

                    },
                    error: function(jqXHR, textStatus, errorThrown) {

                        if(errorThrown == 'timeout'){

                            // When monitoring is disabled ajax call may be still run one time.
                            // So we won't display error if it is disabled
                            if(self.machine.hasMonitoring){
                                Mist.notificationController.timeNotify("Data request timed out. " +
                                                                       "Network connection is down or server doesn't respond",4000);

                                self.machineNotResponding = true;
                            }
                        }
                        else{
                            //Mist.notificationController.timeNotify("An error occurred while retrieving data",4000);
                            error(textStatus);
                        };
                    }
                });
            }
        })
    }
);
