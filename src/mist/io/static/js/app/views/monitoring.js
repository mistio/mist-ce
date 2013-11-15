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

            gotNewData: function(){
                if(Mist.monitoringController.dataUpdated == true)
                {
                    console.log("- We Have New Data At: " + (new Date()).toTimeString());
                    this.cpuGraph.updateData(Mist.monitoringController.data.cpu);
                    this.loadGraph.updateData(Mist.monitoringController.data.load);
                    this.memGraph.updateData(Mist.monitoringController.data.memory);
                    Mist.monitoringController.set('dataUpdated',false);
                }
            }.observes('Mist.monitoringController.dataUpdated'),

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

                    var NUM_OF_MEASUREMENTS = 180; // TODO Change It OR Remove It
                    var NUM_OF_LABELS = 6;

                    this.id = divID;
                    this.width = width;
                    
                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = 160 / 1280 * width;
                    this.height = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.height = fixedHeight;

                    // Calculate The step  of the time axis
                    this.secondsStep =  Math.floor((timeToDisplay.getHours()*60*60 + 
                                        timeToDisplay.getMinutes()*60 + 
                                        timeToDisplay.getSeconds() ) / NUM_OF_LABELS); 
                    this.data = [];
                    var margin = {top: 20, right: 0, bottom: 30, left: 0}; // TODO Fix Margin Based On Aspect Ratio
                    
                    // May Be Removed TODO (Working On Minute And Second Step)
                    if(this.secondsStep == 0) this.secondsStep = 1; // Fix For Science Fixion Request Of 6 Seconds To Display.

                    var xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);
                    var yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);
                    var valueline = d3.svg.line()
                                    .x(function(d) {return xScale(d.time); })
                                    .y(function(d) {return yScale(d.close); });

                    
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
                        console.log("-- Updating Data In Graph #" + this.id);
                        this.data = newData;
                        this.updateView();
                    };
                    
                    this.updateView = function() {
                        // DEBUG
                        console.log("-- Updating View")
                        

                        // TEMP TODO Fix It For Optimize
                        // Get Last NUM_OF_MEASUREMENTS Values
                        if(this.data.length > NUM_OF_MEASUREMENTS)
                        {
                            console.log("--- Before Slice - Data Lenght: " + this.data.length);
                            this.data = this.data.slice(this.data.length-NUM_OF_MEASUREMENTS,this.data.length);
                            console.log("--- After  Slice - Data Lenght: " + this.data.length);
                        }

                        // DEBUG Max And Min Value
                        var values = [];
                        this.data.forEach(function(d){
                                values.push(d.close);
                        });
                        var max = Math.max.apply(Math,values);
                        var min = Math.min.apply(Math,values);
                        console.log("--- Max: " + max);
                        console.log("--- Min: " + min);

                        // Fix Our Values
                        var fixedData = [];
                        this.data.forEach(function(d) {

                            var format = d3.time.format("%X");
                            var tempObj = {};
                            tempObj.time = format.parse(d.time);
                            tempObj.close = +d.close;
                            fixedData.push(tempObj);

                        });
                        
                        xScale.domain(d3.extent(fixedData, function(d) { return d.time; }));
                        yScale.domain([0, d3.max(fixedData, function(d) { return d.close; })]);

                        // Set the valueline path.
                        d3valueLine.attr("d", valueline(fixedData));
            
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

                    monitoringController.setMachine(machine);

                
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
