define('app/views/monitoring', ['app/views/templated','ember'],
    /**
     *
     * Monitoring View
     *
     * @returns Class
     */
    function(TemplatedView) {
        return TemplatedView.extend({

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

                    var setup = function() {

                        // Check if jqm is initialized
                        if(!Mist.isJQMInitialized){

                            window.setTimeout(setup,1000);
                        }
                        else{

                            Em.run.next(function() {

                                // Re-Initialize jquery components and hide buttons
                                self.redrawJQMComponents();     
                                $('.graphBtn').hide(0); 
                                
                                self.createGraphs(600000); // (10*60*1000)
                                

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
                        }
                    }

                    setup();
                    Mist.rulesController.redrawRules();
                }
            }.observes('controller.model.hasMonitoring','viewRendered'),

            /**
            *
            * Re-draws JQM Components of monitoring
            *
            */
            redrawJQMComponents: function(){

                $('.monitoring-button').trigger('create');
                $('#add-rule-button').trigger('create');
                $('#monitoring-dialog').trigger('create');

                $('#graphBar').trigger('create');

                // History And Zoom Buttons
                $('.graphControls').trigger('create');

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

                    var NUM_OF_MEASUREMENT = 60;
                    var MAX_BUFFER_DATA    = 60;


                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = width * 0.125; // (160 / 1280)
                    var margin      = {top: 10, right: 0, bottom: 24, left: 52};

                    this.id               = divID;
                    this.name             = divID.replace('Graph','');
                    this.width            = width;
                    this.height           = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.data             = [];
                    this.timeDisplayed    = timeToDisplayms/1000;
                    this.timeUpdated      = false;
                    this.animationEnabled = true;
                    this.yAxisValueFormat = yAxisValueFormat;
                    this.isAppended       = false;
                    this.displayedData    = [];
                    this.xCordinates      = [];

                    // Distance of two values in graph (pixels), Important For Animation
                    this.valuesDistance = 0;

                    var self = this;


                    // Scale Functions will scale graph to defined width and height
                    width = this.width - margin.left - margin.right;
                    height= this.height - margin.top - margin.bottom;
                    var xScale = d3.time.scale().range([0, width]);
                    var yScale = d3.scale.linear().range([height, 0]);

                    // valueline is function that creates the main line based on data
                    var valueline = d3.svg.line()
                                    .x(function(d) {return xScale(d.time); })
                                    .y(function(d) {return yScale(d.value); })
                                    .defined(function(d) {return d.value != null });


                    // valuearea is function that fills the space under the main line
                    var valuearea = d3.svg.area()
                                    .x(function(d) {return xScale(d.time); })
                                    .y1(function(d) {return yScale(d.value); })
                                    .y0(height)
                                    .defined(function(d) {return d.value != null });
                    
                    // ---------------  SVG elements for graph manipulation --------------------- //
                    // Elements will be added to the dom after first updateData().
                    var d3svg;            // Main SVG element where the graph will be rendered
                    var d3GridX;          // Horizontal grid lines g element
                    var d3GridY;          // Vertical   grid lines g element
                    var d3vLine;          // Main Line that will show the values
                    var d3vArea;          // The are fill underneath d3vLine
                    var d3xAxis;          // Vertical/X Axis With Text(Time)
                    var d3HideAnimeLine;  // A Rectangle that hides the valueline when it's animated
                    var d3xAxisLine;      // The line of the x axis
                    var d3yAxisLine;      // The line of the y axis
                    var d3yAxis;          // Horizontal/Y Axis With Text(Values)


                    //--------------------------------------------------------------------------------------------

                    /**
                     * Represents an Animations series
                     * @constructor
                     * @param {number} bufferSize - The max length of the buffer (default : 3 animations)
                     */
                    function Animation(bufferSize){

                        function _Animation(){
                            this.d3Selector = null;
                            this.fps        = null;
                            this.duration   = null;
                            this.data       = null;
                            this.before     = null;
                            this.after      = null;
                            this.stopFlag   = false;
                            this.startPoint = 0;
                            this.stopPoint  = 0;

                            this.start = function() {

                                if(this.before)
                                    this.before(this.data);

                                var self = this;
                                var intervalTime = 1000 / this.fps;
                                var frame = 0;

                                var start = d3.transform( "translate(" + this.startPoint.x  + "," + this.startPoint.y + ")");
                                var stop   = d3.transform("translate(" + this.stopPoint.x   + "," + this.stopPoint.y  + ")");
                                var interpolate = d3.interpolateTransform(start,stop);

                                // Initial Start
                                this.d3Selector.attr("transform", interpolate(0));

                                // Create Interval For The Animation
                                var animation_interval = window.setInterval(function(){

                                    frame++;


                                    // Get transform Value and aply it to the DOM
                                    var transformValue = interpolate(frame/(self.fps * self.duration));
                                    self.d3Selector.attr("transform", transformValue);

                                    // Check if animation should stop
                                    if(frame >= self.fps * self.duration || self.stopFlag){

                                        // Make sure transform is in the final form
                                        //var transformValue = interpolate(1);
                                        //self.d3Selector.attr("transform", transformValue);
                                        window.clearInterval(animation_interval);
                                        finished();
                                        return;
                                    }


                                },intervalTime);

                                // This function is called when animation stops
                                var finished = function(){

                                    self.stopFlag = false;

                                    if(self.after)
                                        self.after(self.data)

                                    // Inform buffer that animation finished
                                    buffer.nextAnimation();
                                }
                            }

                            this.stop = function(){
                                this.stopFlag = true;
                            }


                        }

                        this.select = function(d3Selector){
                            current_animation.d3Selector = d3Selector;
                            return this;
                        }

                        this.fps = function(fps){
                            current_animation.fps = fps;
                            return this;
                        }

                        this.duration = function(duration){
                            current_animation.duration = duration;
                            return this;
                        }

                        this.points = function(startPointX, startPointY, stopPointX, stopPointY){
                            current_animation.startPoint = {x: startPointX, y: startPointY};
                            current_animation.stopPoint  = {x: stopPointX,  y: stopPointY};
                            return this;
                        }

                        this.data = function(data){
                            current_animation.data = data;
                            return this;
                        }

                        this.before = function(callback){
                            current_animation.before = callback;
                            return this;
                        }

                        this.after = function(callback){
                            current_animation.after = callback;
                            return this;
                        }

                        this.push = function(){
                            buffer.pushAnimation(current_animation);
                            current_animation = new _Animation();
                        }

                        var buffer = []; // The buffer that keeps the animation instances
                        buffer.constSize =  bufferSize ? bufferSize : 3; // Thex max buffer length
                        var current_animation = new _Animation();   // The animation instance where all the changes occur

                        buffer.pushAnimation = function(animation) {

                            this.push(animation);

                            // if buffer was empty start animation immediately, if it was full stop current running
                            if(this.length == 1)
                                this[0].start();
                            else if (this.length > this.constSize)
                                this[0].stop();
                        }

                        buffer.nextAnimation = function() {

                            // Clear Previous Animation
                            this.splice(0,1);
                            // Check if there is new animation to run
                            if(this.length > 0) {
                                this[0].start();
                            }
                        };
                    }

                    /**
                    *
                    * Checks for overflow or less data received fixes them and then updates Graph.
                    * Also appends graphs on initial request
                    * @param {number} timeToDisplay  - The graphs timeWindow in miliseconds
                    *
                    */
                    this.updateData = function(newData) {


                        // Fix for duplicate timestamps
                        if(newData.length > 0 && this.data.length > 0){

                            if(newData[0].time <= this.data[this.data.length-1].time){
                                newData = newData.slice(1);
                            }
                        }


                        // On first run append the Graph
                        if(!this.isAppended){

                            appendGraph(this.id,this.width,this.height);
                            this.isAppended = true;

                            // Do staff after Graph is in the dom and we have data
                            onInitialized();
                        }

                        // Set Our New Data
                        this.data = this.data.concat(newData);

                        // We don't let the buffer have more values than we need.
                        // Check If We Have Overflow , Clip Older Measurement
                        if(this.data.length > MAX_BUFFER_DATA) {

                            var num_of_overflow_Objs = this.data.length - MAX_BUFFER_DATA;
                            this.data = this.data.slice(num_of_overflow_Objs);
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

                        var self           = this;

                        var labelTicksFixed = function(axisInstance,format) {

                            // Check Time Displayed
                            var labelStep;
                            if(self.timeDisplayed <= 600)           // 10 Minutes (10*60)
                                axisInstance.ticks(d3.time.minutes,2);
                            else if(self.timeDisplayed <= 3600)     // 1 Hour (1*60*60)
                                axisInstance.ticks(d3.time.minutes,12);
                            else if(self.timeDisplayed <= 86400)    // 1 Day (24*60*60)
                                axisInstance.ticks(d3.time.hours,6);
                            else if(self.timeDisplayed <= 604800)   // 1 Week (7*24*60*60)
                                axisInstance.ticks(d3.time.days,1);
                            else if(self.timeDisplayed <= 18144000) // 1 Month (30*7*24*60*60)
                                axisInstance.ticks(d3.time.days,7);

                            if( typeof format != 'undefined')
                                axisInstance.tickFormat(d3.time.format(format));

                            return axisInstance;
                        };



                        this.displayedData = [];
                        this.xCordinates   = [];
                        var num_of_displayed_measurements = 60;

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


                        var tLabelFormat = "%I:%M%p";

                        if (this.timeDisplayed >= 86400) // (24*60*60)
                            tLabelFormat = "%d-%m | %I:%M%p";


                        d3xAxis.call(labelTicksFixed(modelXAxis,tLabelFormat));
                        d3GridX.call(labelTicksFixed(modelGridX));

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
                                            if(d>=1073741824)                          // (1024*1024*1024)
                                                return (d/1073741824).toFixed(1) +"G"; // (1024*1024*1024)
                                            else if(d>=1048576)                        // (1024*1024)
                                                return (d/1048576).toFixed(1) +"M";    // (1024*1024)
                                            else if(d>=1024)
                                                return (d/1024).toFixed(1) + "K";
                                            else if(yAxisValueFormat == "%")
                                                return d + "%";
                                            else
                                                return d;
                                          }));

                        // Get path values for value line and area
                        valueLinePath = valueline(this.displayedData);
                        valueAreaPath = valuearea(this.displayedData);


                        // Fix for "Error: Problem parsing d="" " in webkit
                        if(!valueLinePath){
                            valueLinePath = "M 0 0";
                            valueAreaPath = "M 0 0";
                        }


                        // Animate line, axis and grid
                        if(!this.timeUpdated && this.animationEnabled)
                        {

                            // Debug Todo Remove It
                            if(this.name == 'cpu')
                                console.log("Updating Graphs");

                            // Animation values
                            var fps  = 12;
                            var duration = 10;

                            d3vLine.animation.select(d3vLine)
                                             .fps(fps)
                                             .duration(duration)
                                             .points(this.valuesDistance,0, 0,0)
                                             .data(valueLinePath)
                                             .before(function(data){
                                                this.d3Selector.attr("d", data);
                                             })
                                             .push();

                            d3vArea.animation.select(d3vArea)
                                             .fps(fps)
                                             .duration(duration)
                                             .points(this.valuesDistance,0, 0,0)
                                             .data(valueAreaPath)
                                             .before(function(data){
                                                this.d3Selector.attr("d", data);
                                             })
                                             .push();

                            d3xAxis.animation.select(d3xAxis)
                                             .fps(fps)
                                             .duration(duration)
                                             .points(( margin.left + this.valuesDistance),(this.height - margin.bottom +2), margin.left,(this.height - margin.bottom +2))
                                             .push();

                            d3GridX.animation.select(d3GridX)
                                             .fps(fps)
                                             .duration(duration)
                                             .points((margin.left + this.valuesDistance),this.height, margin.left,this.height)
                                             .push();
                        }
                        else {

                            // Update Non-Animated value line and area
                            d3vLine.attr("d", valueLinePath);
                            d3vArea.attr("d", valueAreaPath);

                            // Fix For Animation after time displayed changed
                            if(this.timeUpdated || !this.animationEnabled)
                            {
                                this.timeUpdated = false;

                                /* Not used in new animations TODO implement stop
                                d3vLine.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" + 0 + ")");

                                d3vArea.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" + 0 + ")");

                                d3xAxis.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" +  margin.left + "," + (this.height - margin.bottom +2) + ")");

                                d3GridX.transition()
                                       .duration( 0 )
                                       .attr("transform", "translate(" + margin.left + "," + this.height + ")");*/
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

                        if (!d3svg)
                            return;
                        // Create an aspect ratio
                        var newHeight = width * 0.125; // (160 / 1280)

                        this.height = (newHeight < 85 ? 85 : newHeight);
                        this.width = width;

                        // Set new values to SVG element
                        d3svg.attr('width',this.width)
                             .attr('height',this.height);

                        // Set new height for value are
                        valuearea.y0(this.height - margin.top - margin.bottom);

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

                        d3vArea.transition()
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
                    this.changeTimeWindow = function(newTimeWindow){

                        this.timeDisplayed = newTimeWindow/1000;

                        this.timeUpdated = true;

                        this.clearData();

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

                      d3vArea = d3svg.append('g')
                                     .attr('class','valueArea')
                                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                                     .append('path');

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
                    *   Creates animation instances
                    *
                    */
                    function setupAnimation() {

                        d3vLine.animation = new Animation();
                        d3vArea.animation = new Animation();
                        d3xAxis.animation = new Animation();
                        d3GridX.animation = new Animation();
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


                                    // Fix for the area that has not defined data
                                    if(self.displayedData.length == 0 || self.displayedData[minValueIndex].value == null || self.displayedData[minValueIndex+1].value == null ){
                                        $('#GraphsArea').children('.valuePopUp').text("No Data");
                                        return;
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
                                    if(currentValue>=1073741824)                               // (1024*1024*1024)
                                        valueText = (currentValue/1073741824).toFixed(2) +"G"; // (1024*1024*1024)
                                    else if(currentValue>=1048576)                             // (1024*1024)
                                        valueText = (currentValue/1048576).toFixed(2) +"M";    // (1024*1024)
                                    else if(currentValue>=1024)
                                        valueText = (currentValue/1024).toFixed(2) + "K";
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

                            // Make popup appear at left side when it is at the right edge
                            var popupWidth = $('#GraphsArea').children('.valuePopUp').width();
                            var xAlign = (event.pageX + popupWidth >= window.innerWidth-25) ? -(popupWidth + 15) : 15;

                            // Update popup cords
                            $('#GraphsArea').children('.valuePopUp').css('left',(event.clientX+xAlign) +"px");
                            $('#GraphsArea').children('.valuePopUp').css('top',(event.clientY-35)+"px");

                            updatePopUpValue(this);

                        };

                        var clearUpdatePopUp = function() {

                            isVisible = false;

                            // We check for none display before we hide because jquery will 'show' the element instead
                            // (possible jquery bug ?)
                            var selectorLine = $(this).find('.selectorLine');
                            if($(selectorLine).css('display') != 'none')
                                $(selectorLine).hide(0);

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

                      setupAnimation();
                      setupMouseOver();
                    }

                }

        });
    }
);
