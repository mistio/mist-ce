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
            view: null,

            // This one is called from view
            initController: function(machine,view){
                this.machine = machine;
                this.view = view;
                this.data = {
                    cpu: [],
                    load: [],
                    memory: []
                };
            },

            /**
            * Method: setupDataRequest
            * Receives first data and set time interval for
            * next reuqests
            */
            setupDataRequest: function(){

                var SECONDS_INTERVAL = 10000;

                var self = this;
                var timeGap = 60;

                // First Data Request
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

                // Update Request Every SECONDS_INTERVAL miliseconds
                window.monitoringInterval = window.setInterval(function() {

                    var start = (new Date()).getTime() - (timeGap+10) * 1000;
                    var stop =  (new Date()).getTime() - timeGap * 1000; 
                    var step = 10000; // 10 Second Step

                    self.receiveData(start, stop, step);

                },SECONDS_INTERVAL);
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
                        
                        var controller = Mist.monitoringController;

                        try {

                            if(data.load.length == 0)
                                throw "Received Wrong Server Response";

                            console.log("- Successful Got " + data.load.length + " Data");

                            var receivedData = {
                                cpu:    [],
                                load:   [],
                                memory: []
                            };

                            var metricTime = new Date(start);

                            // Create Custom Objects From Data
                            for(var i=0; i < data.load.length; i++ )
                            {
                                // Create New Data Objects
                                var cpuObj = {
                                    time : (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                    value: (data.cpu.utilization[i] * 100)
                                };
                                var loadObj = {
                                    time : (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                    value: data.load[i]
                                };
                                var memObj = {
                                    time : (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                    value: data.memory[i]
                                };

                                // Push Objects Into Data Object
                                receivedData.cpu.push(cpuObj);
                                receivedData.load.push(loadObj);
                                receivedData.memory.push(memObj);

                                // Substract 10 second from every object
                                metricTime = new Date(metricTime.getTime()+10000);
                            }

                            controller.machine.set('pendingStats', false);
                            self.view.updateGraphs(receivedData);
                            self.finishedGraphUpdate();
                        }
                        catch(err) {
                            Mist.notificationController.notify(err);
                            error(err);
                        }

                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        Mist.notificationController.notify('Error while retrieving Monitoring Data: ' + jqXHR.responseText);
                        error(textStatus, errorThrown, ' while retrieving monitoring data. ', jqXHR.responseText);
                    }
                });
            }
        })
    }
);
