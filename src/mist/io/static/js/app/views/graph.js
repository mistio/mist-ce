define('app/views/graph', ['app/views/templated', 'd3'],
    //
    //  Graph View
    //
    //  @returns Class
    //
    function(TemplatedView) {

        'use strict';

        var MAX_BUFFER_DATA = 60;
        var d3 = require('d3');

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graph: null,
            instance: null,

            svg: null,
            data: null,
            timeDisplayed: null,
            animationEnabled: true,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                Ember.run.next(this, function () {

                    this.graph.set('view', this);
                    this.graph.on('onDataUpdate', this, 'updateData');
                    //this.graph.on('onMetricAdd', this, 'renderGraph');
                    //this.graph.on('onMetricRemove', this, 'renderGraph');

                    this.clearData();
                    this.set('instance', new this.renderGraph(this.graph.id, '', this));
                    this.instance.appendGraph(this.graph.id, this.graph.metrics[0],
                        this.instance.width, this.instance.height);
                    this.updateData(this.graph.metrics[0].datapoints);
                });

            }.on('didInsertElement'),


            unload: function () {

                /*this.graph.off('onDataUpdate', this, 'drawGraph');
                this.graph.off('onMetricAdd', this, 'renderGraph');
                this.graph.off('onMetricRemove', this, 'renderGraph');*/

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            clearData: function () {
                this.set('data', []);
            },


            updateView: function () {
                this.instance.updateView();
            },


            getTimeWindow: function () {
                return this.timeDisplayed;
            },


            enableAnimation: function () {
                this.set('animationEnabled', true);
            },


            disableAnimation: function (immediately) {
                this.set('animationEnabled', false);
                this.instance.clearAnimation(immediately);
            },


            getLastMeasurementTime: function () {
                if (this.data.length)
                    return this.data[this.data.length - 1].time;
            },


            getLastValue: function () {
                if(this.data.length)
                    return this.data[this.data.length - 1];
            },


            changeTimeWindow: function (newTimeWindow) {
                this.set('timeDisplayed', newTimeWindow / 1000);
                this.clearData();
            },


            updateData: function(newData) {

                // Fix for duplicate timestamps
                if(newData.length > 0 && this.data.length > 0){
                    if(newData[0].time <= this.data[this.data.length-1].time){
                        newData = newData.slice(1);
                    }
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
            },


            renderGraph: function (id, format, that) {

                var width = $("#GraphsArea").width() - 2;
                var timeToDisplayms = 600000;
                var yAxisValueFormat = format;

                // Calculate Aspect Ratio Of Height
                var fixedHeight = width * 0.125; // (160 / 1280)
                var margin      = {top: 10, right: 0, bottom: 24, left: 52};

                this.width            = width;
                this.height           = fixedHeight < 85 ? 85 : fixedHeight;
                that.timeDisplayed    = timeToDisplayms / 1000;
                this.yAxisValueFormat = yAxisValueFormat;
                this.displayedData    = [];
                this.xCordinates      = [];
                this.clearAnimPending = false;

                // Distance of two values in graph (pixels), Important For Animation
                this.valuesDistance = 0;

                var self = this;

                // Scale Functions will scale graph to defined width and height
                var width = this.width - margin.left - margin.right;
                var height= this.height - margin.top - margin.bottom;
                var xScale = d3.time.scale().range([0, width]);
                var yScale = d3.scale.linear().range([height, 0]);

                // valueline is function that creates the main line based on data
                var valueline = d3.svg.line()
                                .x(function(d) {return xScale(d.time); })
                                .y(function(d) {return yScale(d.value); })
                                .defined(function(d) {return d.value != null })
                                .interpolate('monotone');

                // valuearea is function that fills the space under the main line
                var valuearea = d3.svg.area()
                                .x(function(d) {return xScale(d.time); })
                                .y1(function(d) {return yScale(d.value); })
                                .y0(height)
                                .defined(function(d) {return d.value != null })
                                .interpolate('monotone');

                /**
                *
                * Updates graph by selecting data from data instance
                * redraws value line, x-axis, labels and grid
                */
                this.updateView = function() {

                    var self = this;

                    var labelTicksFixed = function(axisInstance,format) {

                        // Check Time Displayed
                        var labelStep;
                        if(that.timeDisplayed <= 600)           // 10 Minutes (10*60)
                            axisInstance.ticks(d3.time.minutes,2);
                        else if(that.timeDisplayed <= 3600)     // 1 Hour (1*60*60)
                            axisInstance.ticks(d3.time.minutes,12);
                        else if(that.timeDisplayed <= 86400)    // 1 Day (24*60*60)
                            axisInstance.ticks(d3.time.hours,6);
                        else if(that.timeDisplayed <= 604800)   // 1 Week (7*24*60*60)
                            axisInstance.ticks(d3.time.days,1);
                        else if(that.timeDisplayed <= 18144000) // 1 Month (30*7*24*60*60)
                            axisInstance.ticks(d3.time.days,7);

                        if( typeof format != 'undefined')
                            axisInstance.tickFormat(d3.time.format(format));

                        return axisInstance;
                    };



                    this.displayedData = [];
                    this.xCordinates   = [];
                    var num_of_displayed_measurements = 60;

                    // Get only data that will be displayed
                    if(that.data.length > num_of_displayed_measurements) {

                        this.displayedData = that.data.slice(that.data.length - num_of_displayed_measurements);
                    }
                    else {

                        this.displayedData = that.data;
                    }

                    // If min & max == 0 y axis will not display values. max=1 fixes this.
                    var maxValue = d3.max(this.displayedData, function(d) { return d.value; });
                    var fixedMaxValue =  maxValue || 1;

                    // Set Possible min/max x & y values
                    xScale.domain(d3.extent(this.displayedData , function(d) { return d.time;  }));
                    yScale.domain([0, fixedMaxValue]);

                    // Set the range
                    this.calcValueDistance();
                    if(that.animationEnabled)
                        xScale.range([-this.valuesDistance, this.width - margin.left - margin.right]);
                    else
                        xScale.range([0, this.width - margin.left - margin.right]);


                    // Create Array Of Cordinates
                    this.displayedData.forEach(function (d) {
                        self.xCordinates.push(xScale(d.time));
                    });


                    // Change grid lines and labels based on time displayed
                    var modelXAxis = d3.svg.axis()
                                            .scale(xScale)
                                            .orient('bottom');

                    var modelGridX = d3.svg.axis()
                                           .scale(xScale)
                                           .orient('bottom')
                                           .tickSize(-this.height, 0, 0)
                                           .tickFormat('');

                    var modelGridY = d3.svg.axis()
                                      .scale(yScale)
                                      .orient('left')
                                      .ticks(5)
                                      .tickSize(-this.width, 0, 0)
                                      .tickFormat('');

                    var modelYAxis = d3.svg.axis()
                                      .scale(yScale)
                                      .orient('left')
                                      .ticks(5)
                                      .tickFormat(function(d){
                                        // Custom Y-Axis label formater
                                        if(d>=1073741824)                           // (1024*1024*1024)
                                            return (d/1073741824).toFixed(1) + 'G'; // (1024*1024*1024)
                                        else if(d>=1048576)                         // (1024*1024)
                                            return (d/1048576).toFixed(1) + 'M';    // (1024*1024)
                                        else if(d>=1024)
                                            return (d/1024).toFixed(1) + 'K';
                                        else if(yAxisValueFormat == '%')
                                            return d + '%';
                                        else
                                            return d;
                                      });

                    // Timestamp fix for small screens
                    // 1 Week || 1 Month
                    var tLabelFormat = "%I:%M%p";
                    if( (this.width <= 700 && that.timeDisplayed == 604800) ||  (this.width <= 521 && that.timeDisplayed == 2592000) )
                        tLabelFormat = "%d-%b";
                    else if(this.width <= 560 && that.timeDisplayed == 86400) // 1 Day
                        tLabelFormat = "%I:%M%p";
                    else  if (that.timeDisplayed >= 86400) // 1 Day (24*60*60) >=, should display date as well
                            tLabelFormat = "%d-%m | %I:%M%p";


                    // Get path values for value line and area
                    var valueLinePath = valueline(this.displayedData);
                    var valueAreaPath = valuearea(this.displayedData);

                    // Fix for "Error: Problem parsing d="" " in webkit
                    if(!valueLinePath){
                        valueLinePath = "M 0 0";
                        valueAreaPath = "M 0 0";
                    }

                    // If we changed time window, clear animation buffer
                    /*if(this.timeUpdated){
                        console.log("time updated");
                        this.clearAnimation();
                    }*/


                    // Animate line, axis and grid
                    if(that.animationEnabled && !this.clearAnimPending)
                    {

                        // Animation values
                        var fps  = 12;
                        var duration = 10;

                        that.svg.value.line.animation
                                        .select(that.svg.value.line)
                                        .fps(fps)
                                        .duration(duration)
                                        .points(this.valuesDistance,0, 0,0)
                                        .data(valueLinePath)
                                        .before(function(data){
                                            this.d3Selector.attr("d", data);
                                        })
                                        .push();

                        that.svg.value.area.animation
                                        .select(that.svg.value.area)
                                        .fps(fps)
                                        .duration(duration)
                                        .points(this.valuesDistance,0, 0,0)
                                        .data(valueAreaPath)
                                        .before(function(data){
                                            this.d3Selector.attr("d", data);
                                        })
                                        .push();

                        that.svg.axis.x.legend.animation
                                        .select(that.svg.axis.x.legend)
                                        .fps(fps)
                                        .duration(duration)
                                        .points(( margin.left + this.valuesDistance),(this.height - margin.bottom +2), margin.left,(this.height - margin.bottom +2))
                                        .data({modelX:modelXAxis,modelY: modelYAxis, labelFormat: tLabelFormat})
                                        .before(function(data){
                                            this.d3Selector.call(labelTicksFixed(data.modelX,data.labelFormat));
                                            this.d3Selector.selectAll("text")
                                                           .style("text-anchor", "end")
                                                           .attr('x','-10');
                                            that.svg.axis.y.legend.call(data.modelY);
                                        })
                                        .push();

                        that.svg.grid.x.animation
                                        .select(that.svg.grid.x)
                                        .fps(fps)
                                        .duration(duration)
                                        .points((margin.left + this.valuesDistance),this.height, margin.left,this.height)
                                        .data({modelX: modelGridX,modelY: modelGridY})
                                        .before(function(data){
                                            this.d3Selector.call(labelTicksFixed(data.modelX));
                                            // Y grid should change when x changes
                                            that.svg.grid.y.call(data.modelY);
                                        })
                                        .push();
                    }
                    else {
                        // Update Graph Elements
                        that.svg.value.line.attr("d", valueLinePath);
                        that.svg.value.area.attr("d", valueAreaPath);
                        that.svg.axis.x.legend.call(labelTicksFixed(modelXAxis,tLabelFormat));
                        that.svg.axis.x.legend.selectAll("text")
                               .style("text-anchor", "end")
                               .attr('x','-10');
                        that.svg.axis.y.legend.call(modelYAxis);
                        that.svg.grid.x.call(labelTicksFixed(modelGridX));
                        that.svg.grid.y.call(modelGridY);

                        if(this.clearAnimPending) {
                            // Wait for 50ms for animation to finishes its changes
                            window.setTimeout(function(){
                                that.svg.value.line.attr("transform", "translate(" + 0 + ")");
                                that.svg.value.area.attr("transform", "translate(" + 0 + ")");
                                that.svg.axis.x.legend.attr("transform", "translate(" + margin.left + "," + (self.height - margin.bottom +2) + ")");
                                that.svg.grid.x.attr("transform", "translate(" + margin.left + "," + self.height + ")");
                                self.clearAnimPending = false;
                            },50);
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

                    if (!that.svg.canvas)
                        return;

                    // Create an aspect ratio
                    var newHeight = width * 0.125; // (160 / 1280)

                    this.height = (newHeight < 85 ? 85 : newHeight);
                    this.width = width;

                    // Set new values to SVG element
                    that.svg.canvas
                        .attr('width', this.width)
                        .attr('height', this.height);

                    // Set new height for value are
                    valuearea.y0(this.height - margin.top - margin.bottom);

                    // Update scale to new values
                    yScale = d3.scale.linear().range([this.height - margin.top - margin.bottom, 0]);
                    xScale = d3.time.scale().range([0, this.width - margin.left - margin.right]);

                    // Update x-axis based on new height
                    that.svg.axis.x.legend.attr("transform", "translate(0," + (this.height - margin.bottom) + ")");

                    // Update y-axis line
                    that.svg.axis.x.line.attr('y1',""+(this.height - margin.bottom +2))
                               .attr('y2',""+(this.height - margin.bottom +2))
                               .attr('x2',""+(this.width + margin.left + margin.right));

                    that.svg.axis.y.line.attr('y2',""+ (this.height - margin.bottom +3));

                    updateMouseOverSize();
                    this.clearAnimation(true);
                    this.updateView();
                };


                /**
                *
                * Enables animation of graph
                *
                */
                this.clearAnimation = function(stopCurrent) {

                    that.svg.value.line.animation.clearBuffer(stopCurrent);
                    that.svg.value.area.animation.clearBuffer(stopCurrent);
                    that.svg.axis.x.legend.animation.clearBuffer(stopCurrent);
                    that.svg.grid.x.animation.clearBuffer(stopCurrent);

                    // Reset Transform
                    if (stopCurrent)
                        this.clearAnimPending = true;
                }


                /**
                *
                * Last visible metric
                * @return {object} metric object or null on failure
                */
                this.getLastDisplayedValue = function(){

                    if(that.data){

                        if(that.data.length > 2) {

                            // Get Translate Value
                            var translate =  $("#" + id).find('.valueLine > path').attr('transform');
                            translate = + translate.slice(10,translate.indexOf(','));

                            if(translate == 0)
                                return that.data[that.data.length-1].value;
                            else if(translate == this.valuesDistance)
                                return that.data[that.data.length-2].value;
                            else {
                                var distance = that.data[that.data.length-1].value  - that.data[that.data.length-2].value;

                                // Last value + the part that has been translated
                                return that.data[that.data.length-2].value +
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
                    if(that.data.length >= 2) {

                        var xValueA = xScale(that.data[that.data.length-2].time);
                        var xValueB = xScale(that.data[that.data.length-1].time);
                        this.valuesDistance = xValueB - xValueA;
                    }
                };


                this.appendGraph = function(id, metric, width, height){

                    var name = metric.name;

                    // Generate graph's expand button
                    d3.select('#graphBar')
                        .insert('div')
                        .attr('id', id + '-btn')
                        .attr('class', 'graphBtn')
                        .insert('a')
                        .attr('class', 'ui-btn ui-btn-icon-left ui-icon-carat-u ui-corner-all')
                        .attr('onclick',"Mist.monitoringController.UI.expandPressed('" + id + "')")
                        .text(name);

                    that.set('svg', new SvgSet({
                        id: id,
                        margin: margin,
                        size: {
                            width: width,
                            height: height
                        }
                    }));

                    // Set graph and button visibility
                    var cookies = Mist.monitoringController.cookies;
                    if (cookies.collapsedGraphs.indexOf(metric.id) > -1) {
                        $('#' + id + '-btn').show();
                        $('#' + id).hide();
                    } else {
                        $('#' + id + '-btn').hide();
                        $('#' + id).show();
                    }

                    setupMouseOver();
                }


                /*
                *
                * Setups event listeners for mouse,
                * also creates interval for popup value update
                */
                function setupMouseOver() {

                    // Append the Selector Line
                    var mouseOverLine = that.svg.canvas
                                    .append('line')
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
                        if($($('#' + id).selector + ":hover").length <= 0)
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
                                translate =  $("#" + id).find('.valueLine > path').attr('transform');
                                translate = + translate.slice(10,translate.indexOf(','));
                            }
                            // Measurement That is less than curson x
                            var minValueIndex = 0;
                            var currentValue = 0;

                            for (var i = 0; i < self.xCordinates.length; i++) {

                                if (self.xCordinates[i]+translate > virtualMouseX)
                                    break;
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

                        mouseX = event.pageX - $('#'+ id).children('svg').offset().left;
                        mouseY = event.pageY - $('#'+ id).children('svg').offset().top;

                        // Set Mouse Line Cordinates
                        mouseOverLine.attr('x1', mouseX)
                                     .attr('x2', mouseX);

                        // Make popup appear at left side when it is at the right edge
                        var popupWidth = $('#GraphsArea').children('.valuePopUp').width();
                        var xAlign = (event.pageX + popupWidth >= window.innerWidth-25) ? - (popupWidth + 15) : 15;

                        // Update popup cords
                        $('#GraphsArea').children('.valuePopUp')
                            .css('left', (event.clientX + xAlign) + 'px');

                        $('#GraphsArea').children('.valuePopUp')
                            .css('top', (event.clientY - 35) + 'px');

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
                    $('#' + id).children('svg').mouseenter(function() {
                        // Setup Interval
                        updateInterval = window.setInterval(updatePopUpValue,500);
                    });

                    $('#' + id).children('svg').mouseleave(clearUpdatePopUp);
                    $('#' + id).children('svg').mousemove(updatePopUpOffset);
                }

                function updateMouseOverSize () {
                    that.svg.canvas
                        .select('.selectorLine').attr('y2', self.height - margin.bottom + 3);
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                collapseClicked: function () {
                    Mist.monitoringController.UI.collapsePressed(this.graph.id);
                }
            }
        });


        function SvgSet (args) {

            this.canvas = Canvas(args),

            this.grid = {
                x: GridX(args),
                y: GridY(args)
            };

            this.value = {
                line: Line(args),
                area: Area(args),
                curtain: Curtain(args)
            };

            this.axis = {
                x: {
                    line: AxisLineX(args),
                    legend: AxisX(args)
                },
                y: {
                    line: AxisLineY(args),
                    legend: AxisY(args)
                }
            };

            this.grid.x.animation = new Animation();
            this.value.line.animation = new Animation();
            this.value.area.animation = new Animation();
            this.axis.x.legend.animation = new Animation();
        };


        //
        //
        //  SVG Elements
        //
        //


        function Canvas (args) {

            return d3.select('#' + args.id + ' svg')
                    .attr('width', args.size.width)
                    .attr('height', args.size.height);
        };


        function Line (args) {

            return d3.select('#' + args.id + ' .valueLine')
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + args.margin.top + ')')
                    .select('path');
        };


        function Area (args) {

            return d3.select('#' + args.id + ' .valueArea')
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + args.margin.top + ')')
                    .select('path');
        };


        function GridX (args) {

            return d3.select('#' + args.id + ' .grid-x')
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + args.size.height + ')');
        };


        function GridY (args) {

            return d3.select('#' + args.id + ' .grid-y')
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + args.margin.top + ')');
        };


        function AxisX (args) {

            return d3.select('#' + args.id + ' .x-axis')
                .attr('transform', 'translate(' +
                    args.margin.left + ',' +
                        (args.size.height - args.margin.bottom + 2) + ')');
        };


        function AxisY (args) {

            return d3.select('#' + args.id + ' .y-axis')
                .attr('transform', 'translate(' +
                    args.margin.left + ',' + args.margin.top + ')');
        };


        function AxisLineX (args) {

            return d3.select('#' + args.id + ' .axisLine.x')
                .attr('x1', args.margin.left)
                .attr('y1', args.size.height - args.margin.bottom + 2)
                .attr('x2', args.size.width + args.margin.left + args.margin.right)
                .attr('y2', args.size.height - args.margin.bottom + 2);
        };


        function AxisLineY (args) {

            return d3.select('#' + args.id + ' .axisLine.y')
                .attr('x1', args.margin.left)
                .attr('y1', 0)
                .attr('x2', args.margin.left)
                .attr('y2', args.size.height - args.margin.bottom + 3);
        };


        function Curtain (args) {

            return d3.select('#' + args.id + ' .hideAnimeLine')
                .attr('width', args.margin.left - 1)
                .attr('height',args.size.height + args.margin.top);
        };


        //--------------------------------------------------------------------------------------------

        /**
         * Represents an Animations series
         * @constructor
         * @param {number} bufferSize - The max length of the buffer (default : 3 animations)
         */
        function Animation(bufferSize){

            function _Animation() {

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

                    if (this.before)
                        this.before(this.data);

                    var self = this;
                    var that = this;

                    var frame = 0;
                    var intervalTime = 1000 / this.fps;

                    var start = d3.transform('translate(' +
                        (this.startPoint.x || 0) + ',' + this.startPoint.y + ')');
                    var stop = d3.transform('translate(' +
                        (this.stopPoint.x || 0) + ',' + this.stopPoint.y  + ')');

                    var interpolate = d3.interpolateTransform(start,stop);

                    // Initial Start
                    this.d3Selector.attr("transform", interpolate(0));

                    // TODO: This interval should not be that
                    // deep into the code.

                    // Create Interval For The Animation
                    var animation_interval = window.setInterval(function () {

                        frame++;

                        // Get transform Value and aply it to the DOM
                        var transformValue = interpolate(
                            frame / (that.fps * that.duration));

                        self.d3Selector.attr('transform', transformValue);

                        // Check if animation should stop
                        if(frame >= that.fps * that.duration || that.stopFlag){

                            // Make sure transform is in the final form
                            //var transformValue = interpolate(1);
                            //self.d3Selector.attr("transform", transformValue);
                            window.clearInterval(animation_interval);
                            animationFinished();
                            return;
                        }

                    }, intervalTime);

                    var animationFinished = function () {

                        that.stopFlag = false;

                        if (that.after)
                            that.after(that.data)

                        // Inform buffer that animation finished
                        buffer.nextAnimation();
                    }
                }

                this.stop = function () {
                    this.stopFlag = true;
                }
            }

            // Animation buffer constructor
            function Buffer(size) {

                var buffer = [];
                buffer.maxLength = size || 3; // The max buffer length

                buffer.pushAnimation = function(animation) {

                    this.push(animation);

                    // if buffer was empty start animation immediately, if it was full stop current running
                    if(this.length == 1)
                        this[0].start();
                    else if (this.length > this.maxLength)
                        this[0].stop();
                };

                buffer.nextAnimation = function() {

                    // Clear Previous Animation
                    this.splice(0,1);

                    // Check if there is new animation to run
                    if(this.length > 0)
                        this[0].start();
                };

                return buffer;
            }

            this.select = function (d3Selector) {
                current_animation.d3Selector = d3Selector;
                return this;
            }

            this.fps = function (fps) {
                current_animation.fps = fps;
                return this;
            }

            this.duration = function (duration) {
                current_animation.duration = duration;
                return this;
            }

            this.points = function (startPointX, startPointY, stopPointX, stopPointY) {
                current_animation.startPoint = {x: startPointX, y: startPointY};
                current_animation.stopPoint  = {x: stopPointX,  y: stopPointY};
                return this;
            }

            this.data = function (data) {
                current_animation.data = data;
                return this;
            }

            this.before = function (callback) {
                current_animation.before = callback;
                return this;
            }

            this.after = function (callback){
                current_animation.after = callback;
                return this;
            }

            this.push = function () {
                buffer.pushAnimation(current_animation);
                current_animation = new _Animation();
            }

            this.clearBuffer = function(stopCurrent) {
                if ((typeof stopCurrent == "undefined" || stopCurrent) && buffer.length > 0 ) {
                    buffer[0].stop();
                }

                buffer = Buffer(bufferSize);
            }

            var buffer = new Buffer(bufferSize); // The buffer that keeps the animation instances
            var current_animation = new _Animation();   // The animation instance where all the changes occur
        };
    }
);
