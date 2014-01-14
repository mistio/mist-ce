define('app/views/monitoring', [
    'text!app/templates/monitoring.html', 'ember'],
    /**
     *
     * Monitoring View
     *
     * @returns Class
     */
    function(monitoring_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(monitoring_html),

            graphs : {
                cpu: null,
                load: null,
                memory: null,
                diskRead: null,
                diskWrite: null,
                networkTX: null,
                networkRX: null
            },

            viewRendered: false,
            graphsCreated: false,

            /**
            * 
            * Initialize monitoring view. Automatically called by ember
            *
            */
            init: function() {
                this._super();
                this.setUpGraphs();
            },

            /**
            * 
            * Called by ember when view is rendered
            *
            */
            didInsertElement: function(){
                this._super();
                this.set('viewRendered',true);
            },

            /**
            * 
            * Called by ember when view will be destroyed
            * Stops data request and re-initializes enable button
            *
            */
            willDestroyElement: function(){

                this._super();
                Mist.monitoringController.request.stop();

                // Re-Initialize Enable Button Of Jquery Mobile
                Em.run.next(function() {
                    $('.monitoring-button').button();
                });
            },

            /**
            * 
            * If monitoring is enabled Re-draws jqm components,
            * creates graph instances, initializes controller and
            * setups resize event
            *
            */
            setUpGraphs: function() {

                var machine = this.get('controller').get('model');

                // Check if disable button pressed
                // Then check if everything is ok to render the graphs
                if(machine.id != ' ' && this.viewRendered && !machine.hasMonitoring){

                    Mist.monitoringController.request.stop();
                }
                else if(this.viewRendered && machine.hasMonitoring && !this.graphsCreated &&
                        machine.id != ' '){

                    var self = this;
                    var controller = Mist.monitoringController;

                    Em.run.next(function() {

                        // Re-Initialize jquery components and hide buttons
                        self.redrawJQMComponents();     
                        $('.graphBtn').hide(0); 
                        
                        self.createGraphs(10*60*1000);
                        

                        controller.initialize({
                            machineModel    : machine,      // Send Current Machine
                            graphs          : self.graphs,  // Send Graphs Instances
                        });

                        // Set Up Resolution Change Event
                        $(window).resize(function(){

                            var newWidth = $("#GraphsArea").width() -2;
                            for(metric in self.graphs){
                                 self.graphs[metric].changeWidth(newWidth);
                            }
                        })

                    });

                    Mist.rulesController.redrawRules();
                } 
            }.observes('controller.model.hasMonitoring','viewRendered'),

            /**
            * 
            * Re-draws JQM Components of monitoring
            *
            */
            redrawJQMComponents: function(){

                $('.monitoring-button').button();
                $('#add-rule-button').button();
                $('#monitoring-dialog').popup();  

                // Collapse/Extend Buttons
                $('#cpuGraphBtn > button').button();
                $('#loadGraphBtn > button').button();
                $('#memoryGraphBtn > button').button();
                $('#diskReadGraphBtn > button').button();
                $('#diskWriteGraphBtn > button').button();
                $('#networkTXGraphBtn > button').button();
                $('#networkRXGraphBtn > button').button();

                // DEBUG TODO Possible Remove It
                //$('#timeWindowSelect').selectmenu();

                // History Buttons
                $('#graphsGoBack').button();
                $('#graphsGoForward').button();
                $('#graphsResetHistory').button();

                // Disable History
                $('#graphsGoForward').addClass('ui-disabled');
                $('#graphsResetHistory').addClass('ui-disabled');
            },

            /**
            * 
            * Creates graph instances
            * @param {number} timeToDisplay  - The graphs timeWindow in miliseconds
            *
            */
            createGraphs: function(timeToDisplay){

                // Get Width, -2 left & right border
                var width = $("#GraphsArea").width() -2;  

                this.graphs['cpu']       = new this.Graph('cpuGraph',width,timeToDisplay,"%");
                this.graphs['load']      = new this.Graph('loadGraph',width,timeToDisplay);
                this.graphs['memory']    = new this.Graph('memoryGraph',width,timeToDisplay,"%");
                this.graphs['diskRead']  = new this.Graph('diskReadGraph' ,width,timeToDisplay);
                this.graphs['diskWrite'] = new this.Graph('diskWriteGraph',width,timeToDisplay);
                this.graphs['networkRX'] = new this.Graph('networkRXGraph',width,timeToDisplay);
                this.graphs['networkTX'] = new this.Graph('networkTXGraph',width,timeToDisplay);


                self.graphsCreated = true;
            },
            

            /**
             * Represents a Graph.
             * @constructor
             * @param {string} divID            - The id of div element, this is where graphs will append
             * @param {number} width            - The width of graph
             * @param {number} timeToDisplayms  - The TimeWindow in miliseconds
             * @param {string} yAxisValueFormat - Format for Left axis values ex. 10%
             */
            Graph: function(divID,width,timeToDisplayms,yAxisValueFormat){

                    var NUM_OF_LABELS = 5;
                    var STEP_SECONDS = 10;
                    var NUM_OF_MIN_MEASUREMENTS = 8640; // 24 Hours
                    var NUM_OF_MAX_MEASUREMENTS = 8640; // 24 Hours

                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = 160 / 1280 * width;
                    var margin      = {top: 10, right: 0, bottom: 24, left: 40};

                    this.id               = divID;
                    this.name             = divID.replace('Graph','');
                    this.width            = width;
                    this.height           = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.data             = [];
                    this.timeDisplayed    = timeToDisplayms/1000;
                    this.realDataIndex    = -1;
                    this.timeUpdated      = false;
                    this.animationEnabled = true;
                    this.yAxisValueFormat = yAxisValueFormat;
                    this.isAppended       = false;
                    this.displayedData    = [];
                    this.xCordinates      = [];

                    // Distance of two values in graph (pixels), Important For Animation
                    this.valuesDistance = 0;

                    // Calculate The step  of the time axis
                    this.secondsStep =  Math.floor((timeToDisplayms / 1000) / NUM_OF_LABELS); 
                    
                    var self = this;


                    // Scale Functions will scale graph to defined width and height
                    var xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);
                    var yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);

                    // valueline is function that creates the main line based on data
                    var valueline = d3.svg.line()
                                    .x(function(d) {return xScale(d.time); })
                                    .y(function(d) {return yScale(d.value); });

                    
                    // ---------------  SVG elements for graph manipulation --------------------- //
                    // Elements will be added to the dom after first updateData().
                    var d3svg;            // Main SVG element where the graph will be rendered
                    var d3GridX;          // Horizontal grid lines g element
                    var d3GridY;          // Vertical   grid lines g element
                    var d3vLine;          // Main Line that will show the values
                    var d3xAxis;          // Vertical/X Axis With Text(Time)
                    var d3HideAnimeLine;  // A Rectangle that hides the valueline when it's animated
                    var d3xAxisLine;      // The line of the x axis
                    var d3yAxisLine;      // The line of the y axis
                    var d3yAxis;          // Horizontal/Y Axis With Text(Values)
    

                    //--------------------------------------------------------------------------------------------


                    /**
                    * 
                    * Checks for overflow or less data received fixes them and then updates Graph.
                    * Also appends graphs on initial request
                    * @param {number} timeToDisplay  - The graphs timeWindow in miliseconds
                    *
                    */
                    this.updateData = function(newData) {

                        if(this.data.length == 0)
                        {
                            var dataBuffer = [];
                            var measurements_received = newData.length;
                            if(measurements_received < NUM_OF_MIN_MEASUREMENTS)
                            {
                                // Get First Measurement Time
                                metricTime = new Date(newData[0].time.getTime() - STEP_SECONDS*1000);

                                // Fill Data With Zeros
                                for(var i= 0; i < (NUM_OF_MIN_MEASUREMENTS - measurements_received); i++)
                                {

                                    var zeroObject = {
                                        time: metricTime,
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

                            // Set Our Final Data
                            this.data = dataBuffer;

                            // On first run append the Graph
                            if(!this.isAppended){

                                // Append SVG Elements And Call onInitialized When Finish
                                appendGraph(this.id,this.width,this.height);

                                this.isAppended = true;

                                // Do staff after Graph is in the dom and we have data
                                onInitialized();
                            }
                        }
                        else{

                            // Check If We Have Overflow , Clip Older Measurement
                            if(this.data.length + newData.length > NUM_OF_MAX_MEASUREMENTS)
                            {

                                // Clip Old Data
                                var num_of_overflow_Objs = this.data.length + newData.length - NUM_OF_MAX_MEASUREMENTS;
                                this.data = this.data.slice(num_of_overflow_Objs);
                            }

                            // Set Our Final Data
                            this.data = this.data.concat(newData);
                        }

                        this.updateView();
                    };


                   /**
                    *
                    * Deletes current graph data
                    * 
                    */
                    this.clearData = function() {
                        this.data = [];
                    };
                    

                    /**
                    * 
                    * Updates graph by selecting data from data instance
                    * redraws value line, x-axis, labels and grid
                    */
                    this.updateView = function() {
                        
                        this.displayedData = [];
                        this.xCordinates   = [];
                        var num_of_displayed_measurements = this.timeDisplayed / STEP_SECONDS;

                        // Get only data that will be displayed
                        if(this.data.length > num_of_displayed_measurements) {

                            this.displayedData = this.data.slice(this.data.length - num_of_displayed_measurements);
                        }
                        else {

                            this.displayedData = this.data;
                        }

                        


                        // If min & max == 0 y axis will not display values. max=1 fixes this.
                        var maxValue = d3.max(this.displayedData, function(d) { return d.value; });
                        var fixedMaxValue =  maxValue == 0 ? 1 : maxValue ;

                        // Set Possible min/max x & y values
                        xScale.domain(d3.extent(this.displayedData , function(d) { return d.time;  }));
                        yScale.domain([0, fixedMaxValue]);

                        // Set the range
                        this.calcValueDistance();
                        if(this.animationEnabled)
                            xScale.range([-this.valuesDistance, this.width - margin.left - margin.right]);
                        else
                            xScale.range([0, this.width - margin.left - margin.right]);


                        // Create Array Of Cordinates
                        this.displayedData.forEach(function(d){

                            self.xCordinates.push(xScale(d.time));
                        });


                        // Change grid lines and labels based on time displayed
                        var modelXAxis = d3.svg.axis()
                                                .scale(xScale)
                                                .orient("bottom");

                        var modelGridX = d3.svg.axis()
                                               .scale(xScale)
                                               .orient("bottom")
                                               .tickSize(-this.height, 0, 0)
                                               .tickFormat("");
                        
                        if (this.secondsStep <= 60) {

                            d3xAxis.call(modelXAxis
                                         .ticks(d3.time.seconds, this.secondsStep)
                                         .tickFormat(d3.time.format("%I:%M:%S%p")));

                            d3GridX.call(modelGridX
                                         .ticks(d3.time.seconds, this.secondsStep));
                        }
                        else if (this.secondsStep <= 18000) {

                            d3xAxis.call(modelXAxis
                                         .ticks(d3.time.minutes, this.secondsStep/60)
                                         .tickFormat(d3.time.format("%I:%M%p")));

                            d3GridX.call(modelGridX
                                         .ticks(d3.time.minutes, this.secondsStep/60));
                        }
                        else {

                            d3xAxis.call(modelXAxis
                                         .ticks(d3.time.hours, this.secondsStep/60/60)
                                         .tickFormat(d3.time.format("%I:%M%p")));

                            d3GridX.call(modelGridX
                                         .ticks(d3.time.hours, this.secondsStep/60/60));
                        }

                        // Set time label at left side
                        d3xAxis.selectAll("text") 
                               .style("text-anchor", "end")
                               .attr('x','-10');


                       // Horizontal grid lines will not change on time change
                       d3GridY.call(d3.svg.axis()
                                          .scale(yScale)
                                          .orient("left")
                                          .ticks(5)
                                          .tickSize(-this.width, 0, 0)
                                          .tickFormat(""));

                       d3yAxis.call(d3.svg.axis()
                                          .scale(yScale)
                                          .orient("left")
                                          .ticks(5)
                                          .tickFormat(function(d){
                                            // Custom Y-Axis label formater
                                            if(d>=1000*1000)
                                                return (d/1000/1000) +"M";
                                            else if(d>=1000)
                                                return (d/1000) + "K";
                                            else if(yAxisValueFormat == "%")
                                                return d + "%";
                                            else 
                                                return d;
                                          }));

                        // Animate line, axis and grid
                        if(!this.timeUpdated && this.animationEnabled)
                        {

                            var animationDuration = STEP_SECONDS*1000;
                            
                            // Update Animated Line
                            d3vLine.attr("transform", "translate(" + this.valuesDistance + ")")
                                   .attr("d", valueline(this.displayedData)) 
                                   .transition() 
                                   .ease("linear")
                                   .duration(animationDuration)
                                   .attr("transform", "translate(" + 0 + ")");

                            // Animate Axis And Grid
                            d3xAxis.attr("transform", "translate(" + ( margin.left + this.valuesDistance) + ","+ (this.height - margin.bottom +2) +")")
                                   .transition() 
                                   .ease("linear")
                                   .duration(animationDuration)
                                   .attr("transform", "translate(" +  margin.left + "," + (this.height - margin.bottom +2) + ")");

                            d3GridX.attr("transform", "translate(" + (margin.left + this.valuesDistance) + ","+ this.height +")")
                                   .transition() 
                                   .ease("linear")
                                   .duration(animationDuration)
                                   .attr("transform", "translate(" + margin.left + "," + this.height + ")");
                        }
                        else {

                            // Update Non-Animated value line
                            d3vLine.attr("d", valueline(this.displayedData))

                            // Fix For Animation after time displayed changed
                            if(this.timeUpdated || !this.animationEnabled)
                            {
                                this.timeUpdated = false;

                                d3vLine.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" + 0 + ")");

                                d3xAxis.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" +  margin.left + "," + (this.height - margin.bottom +2) + ")");

                                d3GridX.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" + margin.left + "," + this.height + ")");
                            }
                        }
                    };


                    /**
                    * 
                    * Changes the width of svg element, sets new scale values
                    * and updates height to keep aspect ratio
                    * @param {number} width - Graph new width
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

                        // Update y-axis line
                        d3xAxisLine.attr('y1',""+(this.height - margin.bottom +2))
                                   .attr('y2',""+(this.height - margin.bottom +2))
                                   .attr('x2',""+(this.width + margin.left + margin.right));
                                   
                        d3yAxisLine.attr('y2',""+ (this.height - margin.bottom +3));
                        
                        updateMouseOverSize();

                        this.updateView();
                    };

                    /**
                    *
                    * Enables animation of graph
                    *
                    */
                    this.enableAnimation = function() {

                        this.animationEnabled = true;
                    };


                    /**
                    *
                    * Stops current animation
                    * Next update will be animated
                    *
                    */
                    this.stopCurrentAnimation = function() {

                         d3vLine.transition()
                                .duration( 0 )
                                .attr("transform", "translate(" + 0 + ")");

                        d3xAxis.transition()
                               .duration( 0 )
                               .attr("transform", "translate(" +  margin.left + "," + (this.height - margin.bottom +2) + ")");

                        d3GridX.transition()
                               .duration( 0 )
                               .attr("transform", "translate(" + margin.left + "," + this.height + ")");
                    };


                    /**
                    *
                    * Disables animation of graph
                    * Also stops current animation
                    */
                    this.disableAnimation = function() {

                        this.animationEnabled = false;
                        this.stopCurrentAnimation();
                    };

                    this.disableNextAnimation = function(){
                        this.animationEnabled = false;
                    };


                    /**
                    * 
                    * Finds last measurement of graph data
                    * @return {date} Measurements time or null on failure
                    */
                    this.getLastMeasurementTime = function(){

                        if(this.data.length == 0)
                            return null;
                        else {
                            var lastObject = this.data[this.data.length-1];
                            return lastObject.time;
                        }   
                    };


                    /**
                    * 
                    * Current time window
                    * @return {number} time window in seconds
                    */
                    this.getTimeWindow = function(){

                        return this.timeDisplayed;
                    };


                    /**
                    * 
                    * Last received values
                    * @return {object} metric object or null on failure
                    */
                    this.getLastValue = function(){
                        if(this.data)
                            return this.data[this.data.length - 1];
                        else
                            return null;
                    }


                    /**
                    * 
                    * Last visible metric
                    * @return {object} metric object or null on failure
                    */
                    this.getLastDisplayedValue = function(){

                        if(this.data){

                            if(this.data.length > 2) {

                                // Get Translate Value
                                var translate =  $("#" + this.id).find('.valueLine > path').attr('transform');
                                translate = + translate.slice(10,translate.indexOf(','));

                                if(translate == 0)
                                    return this.data[this.data.length-1].value;
                                else if(translate == this.valuesDistance)
                                    return this.data[this.data.length-2].value;
                                else {
                                    var distance = this.data[this.data.length-1].value  - this.data[this.data.length-2].value;

                                    // Last value + the part that has been translated
                                    return this.data[this.data.length-2].value + 
                                            (distance * (this.valuesDistance-translate) / this.valuesDistance);
                                }

                            }
                        }

                            return null;
                    }


                    /**
                    * 
                    * Calculates the distance between the last two points
                    * Important for animated graph
                    */
                    this.calcValueDistance = function() {
                        
                        // Get last 2 data
                        if(this.data.length >= 2) {

                            var xValueA = xScale(this.data[this.data.length-2].time);
                            var xValueB = xScale(this.data[this.data.length-1].time);
                            this.valuesDistance = xValueB - xValueA;
                        }
                    };


                    /*
                    * 
                    * Changes time window
                    * @param {number} newTimems - New timewindow in miliseconds
                    */
                    this.changeTimeToDisplay = function(newTimems){

                        this.timeDisplayed = newTimems/1000;
                        this.secondsStep   = Math.floor((newTimems / 1000) / NUM_OF_LABELS);

                        this.timeUpdated = true;
                        
                        this.clearData();
                        //this.updateView();
                    };


                    /*
                    * 
                    * Appends the graph into the DOM.
                    * Graph will be inside the id specified.
                    * @param {string} id     - the div where graph will be 
                    * @param {number} width  - the width of the graph
                    * @param {height} height - the height of the graph
                    */
                    function appendGraph(id,width,height){
                      
                      /* Add Graph Element Dynamically
                      d3.select('#GraphsArea').insert('div','#graphBar').attr('id','CustomMetric'+'Graph').attr('class','graph').insert('div').attr('class','header').insert('div').attr('class','title').text('CustomMetric');
                      d3.select('#'+'CustomMetric'+'Graph').select('.header').insert('div').attr('class','closeBtn').attr('onClick',"Mist.monitoringController.UI.collapsePressed('CustomMetric')").text('-');
                      */
                      d3svg =   d3.select("#"+id)
                                  .append('svg')
                                  .attr('width',width)
                                  .attr('height',height);

                      d3GridX = d3.select("#"+id)
                                  .select('svg')
                                  .append("g")         
                                  .attr("class", "grid-x")
                                  .attr("transform", "translate(" + margin.left + "," + height + ")");

                      d3GridY = d3.select("#"+id)
                                  .select('svg')
                                  .append("g")         
                                  .attr("class", "grid-y")
                                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                      d3vLine = d3svg.append('g')
                                     .attr('class','valueLine')
                                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                     .append('path'); 

                      d3xAxis = d3svg.append('g')
                                     .attr('class','x-axis')
                                     .attr("transform", "translate(" + margin.left + "," + (height - margin.bottom +2) + ")");

                      d3HideAnimeLine = d3svg.append('rect')
                                             .attr('class','hideAnimeLine')
                                             .attr('width',margin.left-1)
                                             .attr('height',height+margin.top);

                      d3xAxisLine = d3svg.append('line')
                                         .attr('class','axisLine')
                                         .attr('x1',"" + margin.left)
                                         .attr('y1',""+ (height - margin.bottom +2) )
                                         .attr('x2', width + margin.left + margin.right)
                                         .attr('y2',""+ (height - margin.bottom +2));

                      d3yAxisLine = d3svg.append('line')
                                         .attr('class','axisLine')
                                         .attr('x1',"" + margin.left)
                                         .attr('y1',"0" )
                                         .attr('x2',"" + margin.left)
                                         .attr('y2',""+ (height - margin.bottom +3));

                      d3yAxis = d3svg.append('g')
                                     .attr('class','y-axis')
                                     .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
                    }

                    /*
                    * 
                    * Setups event listeners for mouse,
                    * also creates interval for popup value update
                    */
                    function setupMouseOver() {

                        // Append the Selector Line
                        var mouseOverLine = d3svg.append('line')
                                         .attr('class','selectorLine')
                                         .attr('x1',"" + margin.left)
                                         .attr('y1',"0" )
                                         .attr('x2',"" + margin.left)
                                         .attr('y2',""+ (self.height - margin.bottom +3))
                                         .style("display", "none");

                        var mouseX = 0;
                        var mouseY = 0;
                        var isVisible = false;
                        var updateInterval;

                        var updatePopUpValue = function(graph){

                                // Check if mouse left from element without clearing interval
                                if($($('#' + self.id).selector + ":hover").length <= 0)
                                {
                                   clearUpdatePopUp();
                                   return;
                                }

                                // Update popup when it is over value line
                                if(mouseX > margin.left)
                                {
                                    if(!isVisible){
                                        
                                        $(graph).find('.selectorLine').show(0);
                                        $("#GraphsArea").find('.valuePopUp').show(0);
                                        isVisible = true;
                                    }
                                    // Mouse X inside value line area
                                    var virtualMouseX = mouseX - margin.left;

                                    // Calculate Translate 
                                    var translate = 0;
                                    if(self.animationEnabled){
                                        translate =  $("#" + self.id).find('.valueLine > path').attr('transform');
                                        translate = + translate.slice(10,translate.indexOf(','));
                                    }
                                    // Measurement That is less than curson x
                                    var minValueIndex = 0;
                                    var currentValue = 0;

                                    for(var i=0; i < self.xCordinates.length; i++)
                                    {
                                        if(self.xCordinates[i]+translate > virtualMouseX){
                                            break;
                                        }
                                        else
                                            minValueIndex = i;
                                    } 
                                    
                                    
                                    // Distanse between value before curson and after curson
                                    var distance = self.displayedData[minValueIndex+1].value  - self.displayedData[minValueIndex].value;
                                    // Mouse offset between this two values
                                    var mouseOffset = (virtualMouseX -(self.xCordinates[minValueIndex]+translate))/self.valuesDistance ;
                                    // Cursor's measurement value is the value before the curson + 
                                    // the mouse percentage after the first point * the distance between the values
                                    currentValue = self.displayedData[minValueIndex].value + distance * mouseOffset;
                                    
                                    // Value has a small loss of presition. We don't let it be less than 0
                                    currentValue < 0 ? 0 : currentValue;

                                    // Fix For Big Numbers
                                    var valueText = "";
                                    if(currentValue>=1000*1000)
                                        valueText = (currentValue/1000/1000).toFixed(2) +"M";
                                    else if(currentValue>=1000)
                                        valueText = (currentValue/1000).toFixed(2) + "K";
                                    else if(self.yAxisValueFormat == "%")
                                        valueText = currentValue.toFixed(2) + "%";
                                    else 
                                        valueText = currentValue.toFixed(2);

                                    // Update Value Text
                                    $('#GraphsArea').children('.valuePopUp').text(valueText);
                                } else {

                                    if(isVisible){

                                        $(graph).find('.selectorLine').hide(0);
                                        $("#GraphsArea").find('.valuePopUp').hide(0);
                                        isVisible = false;
                                    }
                                }
                        };


                        var updatePopUpOffset = function(event){
                            mouseX = event.pageX - $('#'+ self.id).children('svg').offset().left;
                            mouseY = event.pageY - $('#'+ self.id).children('svg').offset().top;
                            
                            // Set Mouse Line Cordinates
                            mouseOverLine.attr('x1',"" + mouseX)
                                         .attr('x2',"" + mouseX);
                            $('#GraphsArea').children('.valuePopUp').css('left',(event.clientX+15) +"px");
                            $('#GraphsArea').children('.valuePopUp').css('top',(event.clientY-35)+"px");

                            updatePopUpValue(this);

                        };

                        var clearUpdatePopUp = function() {

                            isVisible = false;
                            $(this).find('.selectorLine').hide(0);
                            $("#GraphsArea").find('.valuePopUp').hide(0);

                            // Clear Interval
                            window.clearInterval(updateInterval);
                        };


                        // Mouse Events
                        $('#' + self.id).children('svg').mouseenter(function() {
                            
                            // Setup Interval
                            updateInterval = window.setInterval(updatePopUpValue,500);
                        });
                        $('#' + self.id).children('svg').mouseleave(clearUpdatePopUp);
                        $('#' + self.id).children('svg').mousemove(updatePopUpOffset);
                    }

                    function updateMouseOverSize() {
                        d3svg.select('.selectorLine').attr('y2',""+ (self.height - margin.bottom +3));
                    }


                    /*
                    * 
                    * Is being called after first data received and 
                    * svg elements are in the dom
                    */
                    function onInitialized(){
                      
                      setupMouseOver();
                    }

                }

                // Features not yet used

                /* Commented Out Until It's Time To Test Zoom In/Out
                selectPressed: function(){

                    var selectValue = $("#timeWindowSelect").val();
                    console.log("time Window");
                    console.log(this.cpuGraph.getTimeWindow());
                    var newTime = 0;
                    var newStep = 10000;
                    if(selectValue.toLowerCase().search("minutes") != -1)
                    {
                        selectValue = selectValue.replace(/\D+/g, '' );
                        console.log("Minutes To Display:" + selectValue);
                        newTime = selectValue * 60 * 1000;

                        if(selectValue > 30)
                            newStep = (selectValue*60 / 180)*1000;

                    }
                    else if(selectValue.toLowerCase().search("hours") != 1 || selectValue.toLowerCase().search("hour") != 1)
                    {
                        selectValue = selectValue.replace(/\D+/g, '' );
                        console.log("Hours To Display:" + selectValue);

                        newTime = selectValue * 60 * 60 * 1000;
                        newStep = (selectValue*60*60 / 180)*1000;

                    }
                    else if(selectValue.toLowerCase().search("days") != 1 || selectValue.toLowerCase().search("day") != 1)
                    {
                        selectValue = selectValue.replace(/\D+/g, '' );
                        console.log("Days To Display:" + selectValue);

                        newTime = selectValue * 24 * 60 * 60 * 1000;
                        newStep = (selectValue * 24 * 60 * 60 / 180)*1000;

                    }

                    // Update Graph Time If selection is not the same
                    // TODO Make it cpugraph independent
                    if(newTime/1000 != this.cpuGraph.getTimeWindow())
                    {
                        this.cpuGraph.changeTimeToDisplay(newTime);
                        this.loadGraph.changeTimeToDisplay(newTime);
                        this.memoryGraph.changeTimeToDisplay(newTime);
                        this.diskReadGraph.changeTimeToDisplay(newTime);
                        this.diskWriteGraph.changeTimeToDisplay(newTime);
                        this.networkTXGraph.changeTimeToDisplay(newTime);
                        this.networkRXGraph.changeTimeToDisplay(newTime);

                        // TODO
                        // Step will be 10 seconds until machine is able to send less values //
                        Mist.monitoringController.updateDataRequest(newTime,10000);
                    }
                },
                */

                /*getLoadLineColor: function(currentLoad,cpuCores){
                    if(currentLoad >= 1 * cpuCores)
                        return "#FF0000";
                    else if(currentLoad >= 0.7 * cpuCores)
                        return "#00FF26";
                    else 
                        return "#6CE0BA";
                },

                setupLoadColorInterval: function(){
                     
                     var self = this;
                     jQuery.Color.hook( "stroke" );

                     window.monitoringLoadColorInterval = window.setInterval(function () {
                        var loadValue = self.loadGraph.getLastDisplayedValue();

                        if(loadValue != null) {

                            var color = self.getLoadLineColor(loadValue,self.cpuCores);
                            $("#loadGraph").find('.valueLine > path').animate( {
                                stroke: jQuery.Color(color)
                            }, 700 );
                        }
                    },1000);
                },

                stopLoadColorInterval: function(){
                    window.clearInterval(window.monitoringLoadColorInterval);
                },*/

        });
    }
);
