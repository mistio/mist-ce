define('app/views/monitoring', [
    'app/views/mistscreen',
    'text!app/templates/monitoring.html', 'ember'],
    /**
     *
     * Monitoring View
     *
     * @returns Class
     */
    function(MistScreen, monitoring_html) {
        return MistScreen.extend({

            template: Ember.Handlebars.compile(monitoring_html),

            cpuGraph: null,
            loadGraph: null,
            memGraph: null,
            viewRendered: false,
            //other Graphs to be added (TODO)

            init: function() {
                this._super();
                this.setUpGraphs();
            },

            // Check If Ember View Rendered
            didInsertElement: function(){
                console.log("- Ember Monitoring View Rendered");
                this.set('viewRendered',true);
                this._super();
            },

            // Check If Ember View Is Destroyed
            willDestroyElement: function(){
                console.log("- Ember Monitoring View Is Being Destroyed");
                window.clearInterval(window.monitoringInterval);
                this._super();
            },

            updateGraphs: function(data){
                    console.log("- We Have New Data At: " + (new Date()).toTimeString());

                    this.cpuGraph.updateData(data.cpu);
                    this.loadGraph.updateData(data.load);
                    this.memGraph.updateData(data.memory);
            },

            clickedCollapse: function(graph){

                $("#" + graph.id).hide(400);
                $("#" + graph.id + "Btn").show(400);
                // DEBUG Todo REMOVE IT
                console.log(graph);
                console.log("clickedCollapse");
            },

            clickedExpand: function(graph){
                
                $("#" + graph.id).show(400);
                $("#" + graph.id + "Btn").hide(400);
                // DEBUG Todo REMOVE IT
                console.log(graph);
                console.log("clickedCollapse");
            },

            // Graph Constructor
            setUpGraphs: function() {
                
                // Graph Constructor
                function Graph(divID,width,timeToDisplay){

                    var NUM_OF_LABELS = 6;
                    var STEP_SECONDS = 10;
                    var NUM_OF_MIN_MEASUREMENTS = 180;  // 30 Minutes
                    var NUM_OF_MAX_MEASUREMENTS = 8640; // 24 Hours

                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = 160 / 1280 * width;
                    var margin = {top: 20, right: 0, bottom: 30, left: 0}; // TODO Fix Margin Based On Aspect Ratio

                    this.id = divID;
                    this.width = width;
                    this.height = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.data = [];
                    this.timeDisplayed = timeToDisplay;
                    this.realDataIndex = -1;

                    // Calculate The step  of the time axis
                    this.secondsStep =  Math.floor((timeToDisplay.getHours()*60*60 + 
                                        timeToDisplay.getMinutes()*60 + 
                                        timeToDisplay.getSeconds() ) / NUM_OF_LABELS); 
                    

                    // Scale Functions will scale graph to defined width and height
                    var xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);
                    var yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);

                    // valueline is function that creates the main line based on data
                    var valueline = d3.svg.line()
                                    .x(function(d) {return xScale(d.time); })
                                    .y(function(d) {return yScale(d.value); });

                    
                    // Create main graph, append svg and other elements
                    var d3svg =   d3.select("#"+this.id)
                                    .append('svg')
                                    .attr('width',this.width)
                                    .attr('height',this.height);

                    var d3GridX = d3.select("#"+this.id)
                                    .select('svg')
                                    .append("g")         
                                    .attr("class", "grid-x")
                                    .attr("transform", "translate(0," + this.height + ")");

                    var d3GridY = d3.select("#"+this.id)
                                    .select('svg')
                                    .append("g")         
                                    .attr("class", "grid-y");

                    var d3vLine = d3svg.append('g')
                                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                       .append('path'); 

                    var d3xAxis = d3svg.append('g')
                                  .attr('class','x-axis')
                                  .attr("transform", "translate(0," + (this.height - margin.bottom +2) + ")");
    

                    //--------------------------------------------------------------------------------------------


                    /**
                    * Method: updateData
                    * Gets Data From Controller, checks for overflow or less data received
                    * fixes them and then updates Graph
                    */
                    this.updateData = function(newData) {

                        if(this.data.length == 0)
                        {
                            info("-- Received First Data");

                            var dataBuffer = [];
                            var measurements_received = newData.length;
                            if(measurements_received < NUM_OF_MIN_MEASUREMENTS)
                            {
                                info("-- Measurement Are Less Than Expected, Filling With 0");
                                // Get First Measurement Time
                                var format = d3.time.format("%X");
                                var metricTime = format.parse(newData[0].time);
                                metricTime = new Date(metricTime.getTime() - STEP_SECONDS*1000);

                                // Fill Data With Zeros
                                for(var i= 0; i < (NUM_OF_MIN_MEASUREMENTS - measurements_received); i++)
                                {
                                    var zeroObject = {
                                        time: (metricTime.getHours() + ":" + metricTime.getMinutes() + ":" + metricTime.getSeconds()),
                                        value: 0
                                    }

                                    dataBuffer.push(zeroObject);
                                    metricTime = new Date(metricTime.getTime() - STEP_SECONDS*1000);
                                }
                                // Set Real Data Start Index
                                this.realDataIndex = dataBuffer.length;
                                dataBuffer.reverse();

                                // Join New Data With Zero Value Array
                                dataBuffer = dataBuffer.concat(newData);
                            }
                            else{

                                dataBuffer = newData;
                            }

                            // Fix Values, TypeCaste To Date And Number
                            var fixedData = [];
                            dataBuffer.forEach(function(d) {
                                
                                var format    = d3.time.format("%X");
                                var tempObj   = {};
                                tempObj.time  = format.parse(d.time);
                                tempObj.value = +d.value;
                                fixedData.push(tempObj);
                            });

                            // Set Our Final Data
                            this.data = fixedData;
                        }
                        else{
                            info("-- Received Data Update, Num Of New Data: " + newData.length);

                            // Check If We Have Overflow , Clip Older Measurement
                            if(this.data.length + newData.length > NUM_OF_MAX_MEASUREMENTS)
                            {
                                info("-- Overflow, Max Data: " + NUM_OF_MAX_MEASUREMENTS + " , Current: " + (this.data.length + newData.length));

                                // Clip Old Data
                                var num_of_overflow_Objs = this.data.length + newData.length - NUM_OF_MAX_MEASUREMENTS;
                                this.data = this.data.slice(num_of_overflow_Objs);
                            }

                            // Fix Values, TypeCaste To Date And Number
                            var fixedData = [];
                            newData.forEach(function(d) {
                                var format = d3.time.format("%X");
                                var tempObj = {};
                                tempObj.time = format.parse(d.time);
                                tempObj.value = +d.value;
                                fixedData.push(tempObj);
                            });

                            // Set Our Final Data
                            this.data = this.data.concat(fixedData);
                            info("-- Updated Data Lenght: " + this.data.length);
                        }

                        this.updateView();
                    };
                    

                    /**
                    * Method: updateView
                    * Updates graph by selecting data from data instance
                    * redraws value line, x-axis, labels and grid
                    */
                    this.updateView = function() {
                        
                        console.log("-- Updating View")
                        
                        var displayedData = [];
                        var num_of_displayed_measurements = (this.timeDisplayed.getHours()*60*60 +
                                                            this.timeDisplayed.getMinutes()*60   +
                                                            this.timeDisplayed.getSeconds()) / STEP_SECONDS;

                        // Get only data that will be displayed
                        if(this.data.length > num_of_displayed_measurements)
                        {
                            displayedData = this.data.slice(this.data.length - num_of_displayed_measurements);
                            console.log("--- After  Slice - Data Lenght: " + displayedData.length);
                        }
                        else
                        {
                            displayedData = this.data;
                        }

                        // Set Possible min/max x & y values
                        xScale.domain(d3.extent(displayedData , function(d) { return d.time;  }));
                        yScale.domain([0, d3.max(displayedData, function(d) { return d.value; })]);

                        // Update value line
                        d3vLine.attr("d", valueline(displayedData));
            
                        // Update xAxis - TODO Fix secondsStep
                        d3xAxis.call(d3.svg.axis()
                                           .scale(xScale)
                                           .orient("bottom")
                                           .ticks(d3.time.minutes, this.secondsStep/60) // TODO Fix SecondsStep
                                           .tickFormat(d3.time.format("%I:%M%p")))
                                           .selectAll("text") 
                                           .style("text-anchor", "end")
                                           .attr('x','-10');

                        // Create Grid
                        d3GridX.call(d3.svg.axis()
                                           .scale(xScale)
                                           .orient("bottom")
                                           .ticks(5)
                                           .tickSize(-this.height, 0, 0)
                                           .tickFormat(""));

                        
                        d3GridY.call(d3.svg.axis()
                                           .scale(yScale)
                                           .orient("left")
                                           .ticks(5)
                                           .tickSize(-this.width, 0, 0)
                                           .tickFormat(""));
                    };


                    /**
                    * Method: changeWidth
                    * Changes the width of svg element, sets new scale values
                    * and updates height to keep aspect ratio
                    */
                    this.changeWidth = function (width) {

                        // Create an aspect ratio
                        var newHeight = 160 / 1280 * width;

                        this.height = (newHeight < 85 ? 85 : newHeight);
                        this.width = width;

                        // Set new values to SVG element
                        d3svg.attr('width',this.width)
                             .attr('height',this.height);

                        // Update scale to new values
                        yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);
                        xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);

                        // Update x-axis based on new height
                        d3xAxis.attr("transform", "translate(0," + (this.height - margin.bottom) + ")");

                        // Update TODO update Grid

                        this.updateView();
                    };


                    /**
                    * Method: getLastMeasurementTime
                    * Returns null if there are no data
                    * else last measurements time as Date object
                    */
                    this.getLastMeasurementTime = function(){

                        if(this.data.length == 0)
                            return null;
                        else {
                            var lastObject = this.data[this.data.length-1];
                            return lastObject.time;
                        }   
                    };
                }

                // -------------------------------------------------------------------------------------

                // Execuation Starts Here
                var machine = this.get('controller').get('model');
                console.log("- Machine Still Probing ?:" + machine.probing);
                console.log("- Machine Set To Probed ?:" + machine.probed);

                if(this.viewRendered && machine.hasMonitoring && !machine.probing && machine.probed){

                    var self = this;
                    var controller = Mist.monitoringController;

                    controller.initController(machine,this);

                
                    Em.run.next(function() {

                        // Re-Initialize Jquery Mobile Buttons, Hide Graph Buttons
                        $('.monitoring-button').button();
                        $('#add-rule-button').button();
                        $('#monitoring-dialog').popup();         
                        $('#cpuGraphBtn').hide(0);
                        $('#loadGraphBtn').hide(0);
                        $('#memGraphBtn').hide(0);  

                        console.log("- Asks For #cpuGraph");       // DEBUG TODO Remove It
                        var width = $('#cpuGraph').width();     // Get Current Width

                        // Create Graphs // TODO change tempDate
                        var tempDate = new Date();
                        tempDate.setHours(0,30,0);
                        self.cpuGraph = new Graph('cpuGraph',width,tempDate);
                        self.loadGraph = new Graph('loadGraph',width,tempDate);
                        self.memGraph = new Graph('memGraph',width,tempDate);

                        controller.setupDataRequest();

                        // Set Up Resolution Change Event
                        $(window).resize(function(){

                                    self.cpuGraph.changeWidth($('#cpuGraph').width());
                                    self.loadGraph.changeWidth($('#loadGraph').width());
                                    self.memGraph.changeWidth($('#memGraph').width());
                        })
                    });
                    
                    Mist.rulesController.redrawRules();
                } 
            }.observes('controller.model.hasMonitoring','controller.model.probing','viewRendered'),

    
        });
    }
);
