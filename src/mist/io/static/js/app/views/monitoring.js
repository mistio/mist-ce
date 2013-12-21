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

            cpuGraph: null,
            loadGraph: null,
            memGraph: null,
            diskReadGraph: null,
            diskWriteGraph: null,
            networkTXGraph: null,
            networkRXGraph: null,

            cpuCores: 0,

            viewRendered: false,
            graphsCreated: false,

            graphsListCookie: null,
            graphsBtnListCookie: null,

            init: function() {
                this._super();
                this.setUpGraphs();
            },

            // Check If Ember View Rendered
            didInsertElement: function(){
                this._super();
                this.set('viewRendered',true);
            },

            // Check If Ember View Is Destroyed Or Disable Pressed
            willDestroyElement: function(){

                this._super();
                // Disable intervals of data request and Load Color change
                window.clearInterval(window.monitoringInterval);
                this.stopLoadColorInterval();

                // Re-Initialize Enable Button Of Jquery Mobile
                Em.run.next(function() {
                    $('.monitoring-button').button();
                });
            },

            updateGraphs: function(data){

                    this.cpuCores = data.cpuCores;
                    this.cpuGraph.updateData(data.cpu);
                    this.loadGraph.updateData(data.load);
                    this.memGraph.updateData(data.memory);

                    this.diskReadGraph.updateData(data.diskRead);
                    this.diskWriteGraph.updateData(data.diskWrite);
                    this.networkRXGraph.updateData(data.netRX);
                    this.networkTXGraph.updateData(data.netTX);
            },

            hideGraphs: function(){

                $('.graph').each(function(){

                    if( $(this).css('display') != 'none' )
                        $(this).hide(0);
                });

                // Get Visible Button List
                $('.graphBtn').each(function(){

                    if( $(this).css('display') != 'none' )
                        $(this).hide(0);
                });
            },

            showGraphs: function(){

                $('.graph').each(function(){

                    if( $(this).css('display') == 'none' )
                        $(this).show(0);
                });

                // Get Visible Button List
                $('.graphBtn').each(function(){

                    if( $(this).css('display') == 'none' )
                        $(this).show(0);
                });
            },

            clickedCollapse: function(graph){

                var self = this;
                // Mobile Hide Animation is slow, disabling animation
                var hideDuration = 400;
                if (Mist.isClientMobile) {
                    
                    hideDuration = 0;
                }

                // Add button to the end of the row
                $("#" + graph.id + "Btn").insertAfter($('.graphBtn').last());

                // When graph is hidden show button and set new coockie 
                $("#" + graph.id).hide(hideDuration, function(){
                    
                    $("#" + graph.id + "Btn").show(0);
                    self.setGraphsCookie();
                });
                
            },

            clickedExpand: function(graph){
                
                var self = this;
                // Mobile Hide Animation is slow, disabling animation
                var hideDuration = 400;
                if (Mist.isClientMobile) {
                    
                    hideDuration = 0;
                }

                // Add graph to the end of the list
                $("#" + graph.id).insertAfter($('.graph').last());

                // When graph is visible set new coockie 
                $("#" + graph.id + "Btn").hide(0);
                $("#" + graph.id).show(hideDuration, function(){

                    self.setGraphsCookie();
                });
                
                
            },

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
                    this.memGraph.changeTimeToDisplay(newTime);
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
            setGraphsCookie: function(){

                var cookieExpire = new Date();
                    cookieExpire.setFullYear(cookieExpire.getFullYear() + 2);
                var graphIdList    = [];
                var graphBtnIdList = [];

                // Get Visible Graphs List
                $('.graph').each(function(){

                    if( $(this).css('display') != 'none' )
                        graphIdList.push($(this).attr('id'));
                });

                // Get Visible Button List
                $('.graphBtn').each(function(){

                    if( $(this).css('display') != 'none' )
                        graphBtnIdList.push($(this).attr('id'));
                });

                // Set graph list and graph button list cookies
                document.cookie = "graphsList=" + graphIdList.join('|') + "; " +
                                "expires=" + cookieExpire.toUTCString() +"; " +
                                "path=/";
                document.cookie = "graphsBtnList=" + graphBtnIdList.join('|') + "; " +
                                "expires=" + cookieExpire.toUTCString() +"; " +
                                "path=/";
            },

            getGraphsCookie: function(){
                
                var cookieValue   = "";
                var graphsList    = [];
                var graphsBtnList = [];

                // Get Graph List Cookie
                var parts = document.cookie.split("graphsList=");
                if (parts.length == 2) 
                    cookieValue = parts.pop().split(";").shift();
                
                if(cookieValue.length > 0){
                    
                    // Create Array Of IDs
                    graphsList = cookieValue.split('|');
                    graphsList.forEach(function(value,index){
                        graphsList[index] = "#" + value;
                    });
                }
                

                // Get Graph Button List Cookie
                var parts = document.cookie.split("graphsBtnList=");
                if (parts.length == 2) 
                    cookieValue = parts.pop().split(";").shift();
                
                if(cookieValue.length > 0){

                    // Create Array Of IDs
                    graphsBtnList = cookieValue.split('|');
                    graphsBtnList.forEach(function(value,index){
                        graphsBtnList[index] = "#" + value;
                    });
                }

                this.graphsListCookie    = graphsList;
                this.graphsBtnListCookie = graphsBtnList;


            },

            redrawGraphButtons: function(){
                $('#cpuGraphBtn > button').button();
                $('#loadGraphBtn > button').button();
                $('#memGraphBtn > button').button();
                $('#diskReadGraphBtn > button').button();
                $('#diskWriteGraphBtn > button').button();
                $('#networkTXGraphBtn > button').button();
                $('#networkRXGraphBtn > button').button();

                // DEBUG TODO Possible Remove It
                $('#timeWindowSelect').selectmenu();
            },

            getLoadLineColor: function(currentLoad,cpuCores){
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
            },

            // Graph Constructor
            setUpGraphs: function() {
                
                /* Class: Graph
                *  
                * 
                */
                function Graph(divID,width,timeToDisplayms,yAxisValueFormat){

                    var NUM_OF_LABELS = 5;
                    var STEP_SECONDS = 10;
                    var NUM_OF_MIN_MEASUREMENTS = 8640; // 24 Hours
                    var NUM_OF_MAX_MEASUREMENTS = 8640; // 24 Hours

                    // Calculate Aspect Ratio Of Height
                    var fixedHeight = 160 / 1280 * width;
                    var margin = {top: 10, right: 0, bottom: 24, left: 40};

                    this.id = divID;
                    this.width = width;
                    this.height = (fixedHeight < 85 ? 85 : fixedHeight);
                    this.data = [];
                    this.timeDisplayed = timeToDisplayms/1000;
                    this.realDataIndex = -1;
                    this.timeUpdated = false;
                    this.yAxisValueFormat = yAxisValueFormat;

                    // DEBUG TODO
                    this.displayedData = [];
                    this.xCordinates = [];

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
                    * Method: updateData
                    * Gets Data From Controller, checks for overflow or less data received
                    * fixes them and then updates Graph. If it is the first data data received
                    * It appends Graph into div and then calls onInitialized
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
                            if(!this.timeUpdated){
                                // Append SVG Elements And Call onInitialized When Finish
                                appendGraph(this.id,this.width,this.height);
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
                    * Method: clearData
                    * Deletes current graph data
                    * 
                    */
                    this.clearData = function() {
                        this.data = [];
                    };
                    

                    /**
                    * Method: updateView
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
                        xScale.range([-this.valuesDistance, this.width - margin.left - margin.right]);


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
                        if(!this.timeUpdated)
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
                            if(this.timeUpdated)
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

                        // Update y-axis line
                        d3xAxisLine.attr('y1',""+(this.height - margin.bottom +2))
                                   .attr('y2',""+(this.height - margin.bottom +2))
                                   .attr('x2',""+(this.width + margin.left + margin.right));
                                   
                        d3yAxisLine.attr('y2',""+ (this.height - margin.bottom +3));
                        

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


                    /**
                    * Method: getLastMeasurementTime
                    * Returns graph's time window in seconds
                    * 
                    */
                    this.getTimeWindow = function(){

                        return this.timeDisplayed;
                    };


                    this.getLastValue = function(){
                        if(this.data)
                            return this.data[this.data.length - 1];
                        else
                            return null;
                    }

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
                    * Method: calcValueDistance
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
                    * Method: changeTimeToDisplay
                    * Changes data that will be displayed and time of x-axis
                    *
                    */
                    this.changeTimeToDisplay = function(newTimems){

                        this.timeDisplayed = newTimems/1000;
                        this.secondsStep   = Math.floor((newTimems / 1000) / NUM_OF_LABELS);

                        this.timeUpdated = true;
                        
                        this.clearData();
                        //this.updateView();
                    };


                    /*
                    * Method: appendGraph
                    * Appends the graph into the div id specified 
                    * by constructor
                    */
                    function appendGraph(id,width,height){
                      
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

                    function setupMouseOver(){

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
                        var updateInterval;

                        var updatePopUpValue = function(){
                                if(mouseX > margin.left)
                                {

                                    // Mouse X inside value line area
                                    var virtualMouseX = mouseX - margin.left;

                                    // Calculate Translate 
                                    var translate =  $("#" + self.id).find('.valueLine > path').attr('transform');
                                    translate = + translate.slice(10,translate.indexOf(','));

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
                                }
                        };


                        var updatePopUpOffset = function(event){
                            mouseX = event.pageX - $('#'+ self.id).children('svg').offset().left
                            mouseY = event.pageY - $('#'+ self.id).children('svg').offset().top
                            if(mouseX > margin.left)
                                {

                                    // Set Mouse Line Cordinates
                                    mouseOverLine
                                         .attr('x1',"" + mouseX)
                                         .attr('x2',"" + mouseX);
                                $('#GraphsArea').children('.valuePopUp').css('left',(event.clientX+15) +"px");
                                $('#GraphsArea').children('.valuePopUp').css('top',(event.clientY-35)+"px");

                                updatePopUpValue();
                            }


                        };


                        // Mouse Events
                        $('#' + self.id).children('svg').mouseenter(function() {

                            $(this).find('.selectorLine').show(0);
                            $("#GraphsArea").find('.valuePopUp').show(0);


                            // Setup Interval
                            updateInterval = window.setInterval(updatePopUpValue,500);
                        });
                        $('#' + self.id).children('svg').mouseleave(function() {

                            $(this).find('.selectorLine').hide(0);
                            $("#GraphsArea").find('.valuePopUp').hide(0);

                            // Clear Interval
                            window.clearInterval(updateInterval);
                        });
                        $('#' + self.id).children('svg').mousemove(updatePopUpOffset);

                    }


                    /*
                    * Method: onInitialized
                    * Is being called after first data received and 
                    * svg elements are in the dom
                    */
                    function onInitialized(){
                      // Run Stuff When Graph is appended and has first data
                      setupMouseOver();
                    }

                }

                // -------------------------------------------------------------------------------------

                // Execuation Starts Here
                var machine = this.get('controller').get('model');

                // Check if disable button pressed
                // Then check if everything is ok to render the graphs
                if(machine.id != ' ' && this.viewRendered && !machine.hasMonitoring){

                    // Stop receiving Graph data
                    window.clearInterval(window.monitoringInterval);
                    // Remove Load Color Change Interval
                    this.stopLoadColorInterval();
                }
                else if(this.viewRendered && machine.hasMonitoring && !this.graphsCreated &&
                        machine.id != ' '){

                    var self = this;
                    var controller = Mist.monitoringController;

                    controller.initController(machine,this);

                
                    Em.run.next(function() {

                        // Re-Initialize Jquery Mobile Buttons
                        $('.monitoring-button').button();
                        $('#add-rule-button').button();
                        $('#monitoring-dialog').popup();   
                        self.redrawGraphButtons();      
                        
                        self.getGraphsCookie();

                        // Show Graphs And Buttons Based On Last Session or show only load Graph
                        if(self.graphsListCookie.length > 0 || self.graphsBtnListCookie.length > 0) {

                            // First Hide All Elements
                            self.hideGraphs();

                            // Re-Arrange And Show Graphs And Buttons
                            for(var i=0; i < self.graphsListCookie.length; i++) 
                            {
                                
                                var id = self.graphsListCookie[i];
                                $(id).insertAfter($('.graph').last());
                                $(id).show(0);

                            }

                            for(var i=0; i < self.graphsBtnListCookie.length; i++) 
                            {
                                
                                var id = self.graphsBtnListCookie[i];
                                $(id).insertAfter($('.graphBtn').last());
                                $(id).show(0);

                            }

                        }
                        else {

                            // Show only load Graph at start
                            $('#loadGraphBtn').hide(0);

                            $('#cpuGraph').hide(0);
                            $('#memGraph').hide(0);  
                            $('#diskReadGraph').hide(0); 
                            $('#diskWriteGraph').hide(0); 
                            $('#networkRXGraph').hide(0); 
                            $('#networkTXGraph').hide(0); 
                        }

                        // Get Width, -2 left & right border
                        var width = $("#GraphsArea").width() -2;  

                        // Create Graphs 
                        var timeToDisplay = 10*60*1000; // 10 minutes
                        self.cpuGraph  = new Graph('cpuGraph',width,timeToDisplay,"%");
                        self.loadGraph = new Graph('loadGraph',width,timeToDisplay);
                        self.memGraph  = new Graph('memGraph',width,timeToDisplay,"%");
                        self.diskReadGraph  = new Graph('diskReadGraph' ,width,timeToDisplay);
                        self.diskWriteGraph = new Graph('diskWriteGraph',width,timeToDisplay);
                        self.networkRXGraph = new Graph('networkRXGraph',width,timeToDisplay);
                        self.networkTXGraph = new Graph('networkTXGraph',width,timeToDisplay);


                        self.graphsCreated = true;

                        controller.setupDataRequest(timeToDisplay,10000);
                        //self.setupLoadColorInterval(); Commented Out Until It's Time To Deploy This Feature TODO

                        // Set Up Resolution Change Event
                        $(window).resize(function(){

                                    var newWidth = $("#GraphsArea").width() -2;
                                    self.cpuGraph.changeWidth(newWidth);
                                    self.loadGraph.changeWidth(newWidth);
                                    self.memGraph.changeWidth(newWidth);
                                    self.diskReadGraph.changeWidth(newWidth);
                                    self.diskWriteGraph.changeWidth(newWidth);
                                    self.networkRXGraph.changeWidth(newWidth);
                                    self.networkTXGraph.changeWidth(newWidth);

                        })
                    });
                    
                    Mist.rulesController.redrawRules();
                } 
            }.observes('controller.model.hasMonitoring','viewRendered'),

        });
    }
);
