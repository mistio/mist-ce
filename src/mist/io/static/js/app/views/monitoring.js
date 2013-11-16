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

                    this.id = divID;
                    this.width = width;
                    
                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = 160 / 1280 * width;
                    this.height = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.height = fixedHeight;
                    this.timeDisplayed = timeToDisplay;

                    // Calculate The step  of the time axis
                    this.secondsStep =  Math.floor((timeToDisplay.getHours()*60*60 + 
                                        timeToDisplay.getMinutes()*60 + 
                                        timeToDisplay.getSeconds() ) / NUM_OF_LABELS); 
                    this.data = [];
                    this.realDataIndex = -1;

                    var margin = {top: 20, right: 0, bottom: 30, left: 0}; // TODO Fix Margin Based On Aspect Ratio
                    
                    // May Be Removed TODO (Working On Minute And Second Step)
                    if(this.secondsStep == 0) this.secondsStep = 1; // Fix For Science Fixion Request Of 6 Seconds To Display.

                    var xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);
                    var yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);
                    var valueline = d3.svg.line()
                                    .x(function(d) {return xScale(d.time); })
                                    .y(function(d) {return yScale(d.value); });

                    
                    // Create Main Graph (SVG Element)
                    var d3svg = d3.select("#"+this.id)
                                .append('svg')
                                .attr('width',this.width)
                                .attr('height',this.height);

                    var d3GridX = d3.select("#"+this.id).select('svg')
                                                        .append("g")         
                                                        .attr("class", "grid-x")
                                                        .attr("transform", "translate(0," + this.height + ")");

                    var d3GridY = d3.select("#"+this.id).select('svg')
                                                        .append("g")         
                                                        .attr("class", "grid-y");

                    var d3valueLine = d3svg.append('g')
                                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                      .append('path'); 

                    var d3xAxis = d3svg.append('g')
                                  .attr('class','x-axis')
                                  .attr("transform", "translate(0," + (this.height - margin.bottom +2) + ")");
    
                    d3xAxis.call(d3.svg.axis()
                                 .scale(xScale)
                                 .orient("bottom")
                                 .ticks(d3.time.minutes, this.secondsStep/60)
                                 .tickFormat(d3.time.format("%I:%M%p")))
                                 .selectAll("text") 
                                 .style("text-anchor", "end")
                                 .attr('x','-10');


                    this.updateData = function(newData) {
                        /*console.log("-- Updating Data In Graph #" + this.id);
                        this.data = newData;
                        this.updateView();*/

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
                                var format = d3.time.format("%X");
                                var tempObj = {};
                                tempObj.time = format.parse(d.time);
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
                    
                    this.updateView = function() {
                        // DEBUG
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
                        xScale.domain(d3.extent(displayedData, function(d) { return d.time; }));
                        yScale.domain([0, d3.max(displayedData, function(d) { return d.value; })]);

                        // Update value line
                        d3valueLine.attr("d", valueline(displayedData));
            
                        // Update xAxis - TODO Fix secondsStep
                        d3xAxis.call(d3.svg.axis()
                                     .scale(xScale)
                                     .orient("bottom")
                                     .ticks(d3.time.minutes, this.secondsStep/60) // TODO Fix SecondsStep
                                     .tickFormat(d3.time.format("%I:%M%p")))
                                     .selectAll("text") 
                                     .style("text-anchor", "end")
                                     .attr('x','-10');


                        
                            d3GridX.call(make_x_grid()
                            .tickSize(-this.height, 0, 0)
                            .tickFormat(""));

                        
                            d3GridY.call(make_y_grid()
                            .tickSize(-this.width, 0, 0)
                            .tickFormat(""));
                        // DEBUG TODO REMOVE IT
                        console.log("");
                    };

                    this.changeWidth = function (width) {

                        // Change Width CSS Attribute And Set New Scale Values
                        this.width = width;
                        d3svg.attr('width',this.width);
                        xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);

                        // Create An Aspect Ratio
                        var newHeight = 160 / 1280 * width;
                        newHeight = (newHeight < 85 ? 85 : newHeight);
                        this.changeHeight(newHeight);
                        // Update View Will Be Done Within changeHeight
                    };

                    // This one will only be called Only From changeWidth TODO Possibly Merge
                    this.changeHeight = function(height) {

                        this.height = height;
                        d3svg.attr('height',this.height);
                        d3xAxis.attr("transform", "translate(0," + (this.height - margin.bottom) + ")");

                        yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);

                        this.updateView();
                    };

                    this.getLastMeasurementTime = function(){

                        if(this.data.length == 0)
                            return null;
                        else
                        {
                            var lastObject = this.data[this.data.length-1];
                            return lastObject.time;
                        }   
                        
                    };

                    function make_x_grid() {        
                        return d3.svg.axis()
                            .scale(xScale)
                            .orient("bottom")
                            .ticks(5);
                    }

                    function make_y_grid() {        
                        return d3.svg.axis()
                            .scale(yScale)
                            .orient("left")
                            .ticks(5);
                    }
                }

                // --- End Of Graph Constructor -- //

                // Execuation Starts Here
                var machine = this.get('controller').get('model');
                console.log("- Machine Still Probing ?:" + machine.probing);
                console.log("- Machine Set To Probed ?:" + machine.probed);

                if(this.viewRendered && machine.hasMonitoring && !machine.probing && machine.probed){

                    var monitoringController = Mist.monitoringController;
                    var self = this;

                    console.log("- Runned setUpGraphs");
                    Em.run.next(function() {
                        try{
                            $('.monitoring-button').button();
                            $('#add-rule-button').button();
                            $('#monitoring-dialog').popup();         
                            $('#cpuGraphBtn').hide(0);
                            $('#loadGraphBtn').hide(0);
                            $('#memGraphBtn').hide(0);               
                        } catch(err){
                            // TODO check what error may produce
                        }
                    });

                    monitoringController.initController(machine,this);

                
                    Em.run.next(function() {

                        console.log("- Asks For #cpuGraph");       // DEBUG TODO Remove It
                        var width = $('#cpuGraph').width();     // Get Current Width

                        // Create Graphs
                        var tempDate = new Date();
                        tempDate.setHours(0,30,0);
                        self.cpuGraph = new Graph('cpuGraph',width,tempDate);
                        self.loadGraph = new Graph('loadGraph',width,tempDate);
                        self.memGraph = new Graph('memGraph',width,tempDate);
                        console.log(self.cpuGraph);
                        console.log("- cpuGraph Created, demoGetData running after"); // DEBUG TODO Remove It
                        Mist.monitoringController.demoGetData();

                        // Set Up Resolution Change Event
                        $(window).resize(function(){

                                    self.cpuGraph.changeWidth($('#cpuGraph').width());
                                    self.loadGraph.changeWidth($('#loadGraph').width());
                                    self.memGraph.changeWidth($('#memGraph').width());
                        })
                    });
                    
                    Mist.rulesController.redrawRules();
                } // Machine Probed
            }.observes('controller.model.hasMonitoring','controller.model.probing','viewRendered'),

    
        });
    }
);
