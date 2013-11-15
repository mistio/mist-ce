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
            machineNotResponding: false, // TODO Add Something if server does not return new data
            data: null,
            dataUpdated: false,

            setMachine: function(machine){
                this.machine = machine;
                this.data = {
                    cpu: [],
                    load: [],
                    memory: []
                };
            },

            // TODO Change Name When Is Fully Working
            demoGetData: function(){

                var self = this;
                var timeGap = 60; // Seconds Between Requested Time And Current
                //Debug TODO Remove It
                // Get Stats For the last hour

                // Just Started Take Last 30 minutes
                if(this.data.load.length == 0)
                {
                    self.machine.set('pendingStats', true);
                    var stop = (new Date()).getTime() - timeGap * 1000;
                    var start = stop - 1800*1000; // Substract Half Hour Of The Stop Date
                    var step = 10000;
                    console.log("- Get First data");
                    console.log("  From : " + (new Date(start)));
                    console.log("  Until: " + (new Date(stop)));
                    self.receiveData(start, stop, step);
                }

                // TODO Set Interval In Object variable maybe Or Find Another Way For The Loop
                window.monitoringInterval = window.setInterval(function(){
                    var start = (new Date()).getTime() - (timeGap+10) * 1000;
                    var stop =  (new Date()).getTime() - timeGap * 1000; 
                    var step = 10000; // 10 Second Step
                    console.log("- Getting Data");
                    console.log("  From : " + (new Date(start)));
                    console.log("  Until: " + (new Date(stop)));
                    self.receiveData(start, stop, step);
                    
                },10000);
            },



            receiveData: function(start,stop,step){

                // Ajax Call For Data Receive
                // Data We Send:
                // start: date/time we want to receive data from
                // stop:  date/time we want to receeive data until
                // step:  miliseconds we want to split data
                $.ajax({
                    url: URL_PREFIX + '/backends/' + this.machine.backend.id +
                         '/machines/' + this.machine.id + '/stats',
                    type: 'GET',
                    async: true,
                    dataType: 'jsonp',
                    data: {'start': Math.floor(start / 1000), 
                            'stop': Math.floor(stop / 1000),
                            'step': step,
                            'auth_key': Mist.auth_key},
                    timeout: 4000,
                    success: function (data, status, xhr){
                        
                        var monitoringController = Mist.monitoringController;
                        // TODO , Possible Remove It
                        if(data.load.length == 0) // No Data Returned
                        {
                            console.log("- Oops Data Returned Are Null... Run Again");
                            Mist.monitoringController.receiveData(start,stop,step);
                        }
                        else
                        {
                            console.log("- Successful Got " + data.load.length + " Data");
                            console.log("- Pushing Data To Array");

                            // For X CPU Objects That Exist Create Object And Add Push Them
                            // Add A CPU Objects
                            var metricTime = new Date(start);
                            for(var i=0; i < data.load.length; i++ )
                            {
                                // Create New Data Objects
                                var cpuObj = {
                                    time : (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                    close: (data.cpu.utilization[i] * 100)
                                };
                                var loadObj = {
                                    time : (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                    close: data.load[i]
                                };
                                var memObj = {
                                    time : (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                    close: data.memory[i]
                                };

                                // Push Object Into Data Object
                                monitoringController.data.cpu.push(cpuObj);
                                monitoringController.data.load.push(loadObj);
                                monitoringController.data.memory.push(memObj);

                                metricTime = new Date(metricTime.getTime()+10000);// Substract 10 second from every object
                            }
                            monitoringController.machine.set('pendingStats', false);
                            console.log("- Sets Data Updated, Graph Must Be Updated")
                            monitoringController.set('dataUpdated',true);
                            //console.log(Mist.monitoringController.data);
                        }

                    },
                    error: function (){
                        info("Error Produced While Retrieving Data For Monitoring");
                    }
                });
            }
        })
    }
);
