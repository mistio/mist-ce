define('app/views/graph_list_item', ['app/views/templated', 'd3'],
    //
    //  Graph View
    //
    //  @returns Class
    //
    function (TemplatedView, d3) {

        'use strict';

        var DISPLAYED_DATAPOINTS = 60;

        var LINE_COLOR_MAP = {
            0: 'green',
            1: 'orange',
            2: 'blue',
            3: 'pink',
            4: 'brick'
        };

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graph: null,

            scale: {
                x: null,
                y: null,
            },

            svg: null,
            unit: null,
            data: null,
            width: null,
            height: null,
            margin: null,
            valuearea: null,
            valueline: null,
            xCoordinates: null,
            displayedData: null,
            timeDisplayed: null,
            valuesDistance: null,
            animationEnabled: true,
            clearAnimPending: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                info('graph list item inserted');

                // Add event handlers
                this.graph.on('onDatasourceAdd', this, 'updateSVG');
                this.graph.on('onDatasourceRemove', this, 'updateSVG');

                this.graph.set('view', this);
                this.setupGraph();
                this.setupMouseOver();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event handlers
                this.graph.on('onDatasourceAdd', this, 'updateSVG');
                this.graph.on('onDatasourceRemove', this, 'updateSVG');

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            updateSVG: function () {
                this.set('svg', SvgSet(this));
                var datasources = this.graph.datasources;
                datasources.forEach(function (datasource) {
                    $('#' + this.graph.id + ' .title #' + datasource.id)
                        .addClass(LINE_COLOR_MAP[datasources.indexOf(datasource)]);
                }, this);
            },


            draw: function () {
                this.updateView();
            },


            clearData: function () {
                this.graph.datasources.forEach(function (datasource) {
                    datasource.clear();
                });
            },


            enableAnimation: function () {
                this.set('animationEnabled', true);
            },


            updateData: function(newData) {
                this.data = newData;
                this.updateView();
            },


            updateScale: function () {
                this.scale = new Object({
                    x: ScaleX(this),
                    y: ScaleY(this),
                });
            },


            disableAnimation: function (immediately) {
                this.set('animationEnabled', false);
                this.clearAnimation(immediately);
            },


            changeTimeWindow: function (newTimeWindow) {
                this.set('timeDisplayed', newTimeWindow / 1000);
                this.clearData();
            },


            clearAnimation: function(stopCurrent) {

                if (this.graph.pendingCreation)
                    return;

                this.svg.value.lines.forEach(function (line) {
                    line.animation.clearBuffer(stopCurrent);
                });
                this.svg.axis.x.legend.animation.clearBuffer(stopCurrent);
                this.svg.grid.x.animation.clearBuffer(stopCurrent);

                // Reset Transform
                if (stopCurrent)
                    this.clearAnimPending = true;
            },


            isVisible: function () {
                return $('#' + this.graph.id).css('display') != 'none';
            },


            /**
            *
            * Changes the width of svg element, sets new scale values
            * and updates height to keep aspect ratio
            * @param {number} width - Graph new width
            */
            changeWidth: function (width) {

                if (this.graph.pendingCreation)
                    return;

                if (!this.svg.canvas)
                    return;

                // Create an aspect ratio
                //var newHeight = width * 0.125; // (160 / 1280)
                var newHeight = width * 0.3; // (160 / 1280)

                this.height = (newHeight < 85 ? 85 : newHeight);
                this.width = width;

                // Set new values to SVG element
                this.svg.canvas
                    .attr('width', this.width)
                    .attr('height', this.height);

                // Update scale to new values
                this.updateScale();

                // Update x-axis based on new height
                this.svg.axis.x.legend.attr('transform', 'translate(0,' + (this.height - this.margin.bottom) + ')');

                // Update y-axis line
                this.svg.axis.x.line.attr('y1', this.height - this.margin.bottom + 2)
                           .attr('y2', this.height - this.margin.bottom + 2)
                           .attr('x2', this.width + this.margin.left + this.margin.right);

                this.svg.axis.y.line.attr('y2', this.height - this.margin.bottom + 3);

                // Update mouse over size
                this.svg.canvas
                    .select('.selectorLine').attr('y2', this.height - this.margin.bottom + 3);

                this.clearAnimation(true);
                this.updateView();
            },


            /*
            *
            * Setups event listeners for mouse,
            * also creates interval for popup value update
            */
            setupMouseOver: function () {

                return;

                var that = this;

                // Append the Selector Line
                var mouseOverLine = this.svg.canvas
                                .append('line')
                                .attr('class','selectorLine')
                                .attr('x1', this.margin.left)
                                .attr('y1','0' )
                                .attr('x2', this.margin.left)
                                .attr('y2', this.height - this.margin.bottom + 3)
                                .style('display', 'none');

                var mouseX = 0;
                var mouseY = 0;
                var isVisible = false;
                var updateInterval;

                var updatePopUpValue = function(graph) {

                    // Check if mouse left from element without clearing interval
                    if($($('#' + that.graph.id).selector + ':hover').length <= 0)
                    {
                       clearUpdatePopUp();
                       return;
                    }

                    // Update popup when it is over value line
                    if(mouseX > that.margin.left)
                    {
                        if(!isVisible){
                            Mist.graph = $(graph);
                            $(graph).find('.selectorLine').show(0);
                            $('#GraphsArea').find('.valuePopUp').show(0);
                            isVisible = true;
                        }
                        // Mouse X inside value line area
                        var virtualMouseX = mouseX - that.margin.left;

                        // Calculate Translate
                        var translate = 0;
                        if(that.animationEnabled){
                            translate =  $('#' + that.graph.id).find('.valueLine > path').attr('transform');
                            translate = + translate.slice(10,translate.indexOf(','));
                        }
                        // Measurement That is less than curson x
                        var minValueIndex = 0;
                        var currentValue = 0;

                        for (var i = 0; i < that.xCoordinates.length; i++) {

                            if (that.xCoordinates[i]+translate > virtualMouseX)
                                break;
                            else
                                minValueIndex = i;
                        }


                        // Fix for the area that has not defined data
                        if(that.displayedData.length == 0 || that.displayedData[minValueIndex].value == null || that.displayedData[minValueIndex+1].value == null ){
                            $('#GraphsArea').children('.valuePopUp').text('No Data');
                            return;
                        }


                        // Distanse between value before curson and after curson
                        var distance = that.displayedData[minValueIndex+1].value  - that.displayedData[minValueIndex].value;
                        // Mouse offset between this two values
                        var mouseOffset = (virtualMouseX -(that.xCoordinates[minValueIndex]+translate))/that.valuesDistance ;
                        // Cursor's measurement value is the value before the curson +
                        // the mouse percentage after the first point * the distance between the values
                        currentValue = that.displayedData[minValueIndex].value + distance * mouseOffset;

                        // Value has a small loss of presition. We don't let it be less than 0
                        currentValue < 0 ? 0 : currentValue;

                        // Fix For Big Numbers
                        var valueText = '';
                        if(currentValue>=1073741824)                               // (1024*1024*1024)
                            valueText = (currentValue/1073741824).toFixed(2) +'G'; // (1024*1024*1024)
                        else if(currentValue>=1048576)                             // (1024*1024)
                            valueText = (currentValue/1048576).toFixed(2) +'M';    // (1024*1024)
                        else if(currentValue>=1024)
                            valueText = (currentValue/1024).toFixed(2) + 'K';
                        else if(that.yAxisValueFormat == '%')
                            valueText = currentValue.toFixed(2) + '%';
                        else
                            valueText = currentValue.toFixed(2);

                        // Update Value Text
                        $('#GraphsArea').children('.valuePopUp').text(valueText);
                    } else {

                        if(isVisible){

                            $(graph).find('.selectorLine').hide(0);
                            $('#GraphsArea').find('.valuePopUp').hide(0);
                            isVisible = false;
                        }
                    }
                };


                var updatePopUpOffset = function(event) {

                    mouseX = event.pageX - $('#'+ that.graph.id).children('svg').offset().left;
                    mouseY = event.pageY - $('#'+ that.graph.id).children('svg').offset().top;

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

                    $('#GraphsArea').find('.valuePopUp').hide(0);

                    // Clear Interval
                    window.clearInterval(updateInterval);
                };


                // Mouse Events
                $('#' + this.graph.id).children('svg').mouseenter(function() {
                    // Setup Interval
                    updateInterval = window.setInterval(updatePopUpValue,500);
                });

                $('#' + this.graph.id).children('svg').mouseleave(clearUpdatePopUp);
                $('#' + this.graph.id).children('svg').mousemove(updatePopUpOffset);
            },


            setupGraph: function () {

                var id = this.graph.id;
                this.id = id;
                this.width = $('#' + this.id).width() - 2;

                 // Calculate Aspect Ratio Of Height
                var fixedHeight = this.width * 0.125; // (160 / 1280)

                this.height = fixedHeight < 85 ? 85 : fixedHeight;
                this.margin = {top: 10, right: 0, bottom: 24, left: 52};;
                this.timeDisplayed    = 600;  // 10 minutes
                this.yAxisValueFormat = '';
                this.displayedData    = [];
                this.xCoordinates      = [];
                this.clearAnimPending = false;

                // Distance of two values in graph (pixels), Important For Animation
                this.valuesDistance = 0;

                this.updateScale();

                // valueline is function that creates the main line based on data
                this.set('valueline', ValueLine(this));

                // valuearea is function that fills the space under the main line

                this.updateSVG();
                return;

                // Set graph visibility
                var cookies = Mist.monitoringController.cookies;
                if (cookies.collapsedGraphs.indexOf(this.graph.metrics[0].hashedId) > -1)
                    $('#' + id).hide();
                else
                    $('#' + id).show();
            },



            _setDisplayedDatapoints: function () {

                // Parse each datasource of the graph and get only
                // the last datapoints of the array (the ones that
                // will be displayed)
                //
                // Then store the displayed datapoints into "displayedData"
                // object using the id of each datasource as the property key

                this.set('displayedData', {});
                this.graph.datasources.forEach(function (datasource) {
                    this.displayedData[datasource.id] =
                        datasource.datapoints.slice(
                            datasource.datapoints.length - DISPLAYED_DATAPOINTS);
                }, this);
            },


            _setMinMaxValues: function () {

                // Parse the datapoints to be displayed and
                // callulcate the overal min and max values

                // If min & max == 0 y axis will not display
                // values. max=1 fixes this.
                var maxValue = 1;
                var minValue = 0;
                forIn(this.displayedData, function (datapoints) {
                    var max = d3.max(datapoints, getDatapointValue);
                    var min = d3.min(datapoints, getDatapointValue);
                    if (max > maxValue) maxValue = max;
                    if (min < minValue) minValue = min;
                });

                // If minValue is not negative, use 0 as the min
                // value because it is visually better
                if (minValue >= 0) minValue = 0;

                this.set('maxValue', maxValue);
                this.set('minValue', minValue);
            },


            _setScale: function () {

                // Update x and y scales to fit the data to be displayed
                var firstDatasourceId = this.graph.datasources[0].id;
                this.scale.y.domain(
                    [this.minValue, this.maxValue]);
                this.scale.x.domain(
                    d3.extent(this.displayedData[firstDatasourceId], getDatapointTime));
            },


            _setXCoordinates: function () {

                // Parse datapoints to be displayed and construct
                // arrays of x coordinates for each datasource
                //
                // Then store these coordinates into "xCoordinates" object
                // using the id of each datasource as the property key

                this.set('xCoordinates', {});
                forIn(this, this.displayedData, function (datapoints, datasourceId) {
                    this.xCoordinates[datasourceId] = [];
                    datapoints.forEach(function (datapoint) {
                        this.xCoordinates[datasourceId].push(
                            this.scale.x(datapoint.time));
                    }, this);
                });
            },


            _setValueDistance: function () {

                // Get the time of the last two datapoints and calculate
                // the x scale distance
                //
                // It doesn't matter from which datasource we extract
                // the last two datapoints because the timestamps are
                // all alligned.

                var datapoints = this.graph.datasources[0].datapoints;

                if (datapoints.length < 2) return;

                var lastDatapoints = datapoints.slice(datapoints.length - 2);

                this.set('valuesDistance',
                    this.scale.x(lastDatapoints[1].time) -
                    this.scale.x(lastDatapoints[0].time));
            },


            _setRange: function () {

                // TODO (gtsop): Add description

                this.scale.x.range([
                    this.animationEnabled ? -this.valuesDistance : 0,
                    this.width - this.margin.left - this.margin.right
                ]);
            },


            _setLabelFormat: function () {

                // TODO (gtsop): Add description

                // Timestamp fix for small screens
                var tLabelFormat = '%I:%M%p';
                if ((this.width <= 700 && this.timeDisplayed == 604800) ||
                    (this.width <= 521 && this.timeDisplayed == 2592000)) // 1 Week || 1 Month
                        tLabelFormat = '%d-%b';
                else if (this.width <= 560 && this.timeDisplayed == 86400) // 1 Day
                    tLabelFormat = '%I:%M%p';
                else if (this.timeDisplayed >= 86400) // 1 Day (24*60*60) >=, should display date as well
                    tLabelFormat = '%d-%m | %I:%M%p';
                this.set('labelFormat', tLabelFormat);
            },


            _setValueLinePaths: function () {

                // TODO (gtsop): Add description

                this.set('valueLinePaths', {});
                forIn(this, this.displayedData, function (datapoints, datasourceId) {
                    this.valueLinePaths[datasourceId] =
                        this.valueline(datapoints) ||
                            'M 0 0' // Fix for 'Error: Problem parsing d='' ' in webkit
                });
            },

            /**
            *
            * Updates graph by selecting data from data instance
            * redraws value line, x-axis, labels and grid
            */
            updateView: function () {

                if (!this.isVisible())
                    return;

                this._setDisplayedDatapoints();
                this._setMinMaxValues();
                this._setScale();
                this._setXCoordinates();
                this._setValueDistance();
                this._setRange();
                this._setLabelFormat();

                // <should-work-well>
                var that = this;
                // Change grid lines and labels based on time displayed
                var modelXAxis = d3.svg.axis()
                    .scale(this.scale.x)
                    .orient('bottom');

                var modelGridX = d3.svg.axis()
                                       .scale(this.scale.x)
                                       .orient('bottom')
                                       .tickSize(-this.height, 0, 0)
                                       .tickFormat('');

                var modelGridY = d3.svg.axis()
                                  .scale(this.scale.y)
                                  .orient('left')
                                  .ticks(5)
                                  .tickSize(-this.width, 0, 0)
                                  .tickFormat('');

                var modelYAxis = d3.svg.axis()
                                  .scale(this.scale.y)
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
                                    else if(that.yAxisValueFormat == '%')
                                        return d + '%';
                                    else
                                        return d;
                                  });

                // </should-work-well>

                this._setValueLinePaths();

                // Animate line, axis and grid
                if (this.animationEnabled && !this.clearAnimPending) {

                    // Animation values
                    var fps  = 12;
                    var duration = 9;

                    this.svg.value.lines.forEach(function (line) {
                        line.animation
                            .select(line)
                            .fps(fps)
                            .duration(duration)
                            .points(this.valuesDistance, 0, 0, 0)
                            .data(this.valueLinePaths[line.id])
                            .before(function (data) {
                                this.d3Selector.attr('d', data);
                            })
                            .push();
                    }, this);


                    this.svg.axis.x.legend.animation
                                    .select(this.svg.axis.x.legend)
                                    .fps(fps)
                                    .duration(duration)
                                    .points(( this.margin.left + this.valuesDistance),(this.height - this.margin.bottom +2), this.margin.left,(this.height - this.margin.bottom +2))
                                    .data({modelX:modelXAxis,modelY: modelYAxis, labelFormat: this.labelFormat})
                                    .before(function(data){
                                        this.d3Selector.call(labelTicksFixed(data.modelX,data.labelFormat, that.timeDisplayed));
                                        this.d3Selector.selectAll('text')
                                                       .style('text-anchor', 'end')
                                                       .attr('x','-10');
                                        that.svg.axis.y.legend.call(data.modelY);
                                    })
                                    .push();

                    this.svg.grid.x.animation
                                    .select(this.svg.grid.x)
                                    .fps(fps)
                                    .duration(duration)
                                    .points((this.margin.left + this.valuesDistance),this.height, this.margin.left,this.height)
                                    .data({modelX: modelGridX,modelY: modelGridY})
                                    .before(function(data){
                                        this.d3Selector.call(labelTicksFixed(data.modelX, null, that.timeDisplayed));
                                        // Y grid should change when x changes
                                        that.svg.grid.y.call(data.modelY);
                                    })
                                    .push();

                } else {

                    // Update Graph Elements
                    this.svg.value.lines.forEach(function (line) {
                        line.attr('d', this.valueLinePaths[line.id]);
                    }, this);
                    this.svg.axis.x.legend.call(labelTicksFixed(modelXAxis,this.abelFormat, this.timeDisplayed));
                    this.svg.axis.x.legend.selectAll('text')
                           .style('text-anchor', 'end')
                           .attr('x','-10');
                    this.svg.axis.y.legend.call(modelYAxis);
                    this.svg.grid.x.call(labelTicksFixed(modelGridX, null, this.timeDisplayed));
                    this.svg.grid.y.call(modelGridY);

                    if (this.clearAnimPending) {
                        // Wait for 50ms for animation to finishes its changes
                        window.setTimeout(function(){
                            that.svg.value.lines.forEach(function (line) {
                                line.attr('transform', 'translate(' + 0 + ')');
                            })
                            that.svg.axis.x.legend.attr('transform', 'translate(' + that.margin.left + ',' + (that.height - that.margin.bottom + 2) + ')');
                            that.svg.grid.x.attr('transform', 'translate(' + that.margin.left + ',' + that.height + ')');
                            that.clearAnimPending = false;
                        }, 50);
                    }
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
                },

                removeClicked: function () {

                    Mist.confirmationController.set('title', 'Remove graph');

                    var machine = Mist.monitoringController.request.machine;
                    var graph = this.graph;

                    var message = 'Are you sure you want to remove "' +
                        graph.metrics[0].name + '"';

                    var callback = null;
                    var metric = graph.metrics[0];

                    if (metric.isPlugin) {
                        message += ' and disable it from server ' + machine.name;
                    }

                    message += ' ?';

                    var removeGraph = function (success) {
                        if (success) {
                            Mist.monitoringController.graphs.removeGraph(graph,
                                function (success) {
                                    if (success)
                                        that.graph.set('pendingRemoval', false);
                            });
                        } else {
                            that.graph.set('pendingRemoval', false);
                        }
                    }

                    var that = this;
                    Mist.confirmationController.set('text', message);
                    Mist.confirmationController.set('callback', function () {
                        if (metric.isPlugin) {
                            Mist.metricsController.disableMetric(
                                metric, machine, removeGraph);
                        } else {
                            removeGraph(true);
                        }
                    });
                    this.graph.set('pendingRemoval', true);
                    Mist.confirmationController.show();
                }
            }
        });


        function SvgSet (args) {

            var svg = new Object();
            svg.canvas = Canvas(args);
            svg.grid = new Object({
                x: GridX(args),
                y: GridY(args)
            });
            svg.axis = new Object({
                x: new Object({
                    line: AxisLineX(args),
                    legend: AxisX(args)
                }),
                y: new Object({
                    line: AxisLineY(args),
                    legend: AxisY(args)
                })
            });
            svg.value = new Object({
                lines: [],
                curtain: Curtain(args)
            });

            // Popuplate value lines
            args.graph.datasources.forEach(function (datasource) {
                var line = Line(args, datasource);
                line.animation = new Animation();
                line.id = datasource.id;
                svg.value.lines.push(line);
            });

            svg.grid.x.animation = new Animation();
            svg.axis.x.legend.animation = new Animation();

            return svg;
        };


        //
        //
        //  SVG Elements
        //
        //


        function Canvas (args) {

            return d3.select('#' + args.id + ' svg')
                    .attr('width', args.width)
                    .attr('height', args.height);
        };


        function Line (args, datasource) {
            var index = args.graph.datasources.indexOf(datasource);
            return d3.select('#' + args.id + ' .' + datasource.id)
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + args.margin.top + ')')
                    .attr('class', 'valueLine ' + LINE_COLOR_MAP[index])
                    .select('path');
        };


        function Area (args) {

            return d3.select('#' + args.id + ' .valueArea')
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + (args.margin.top + 2)+ ')')
                    .select('path');
        };


        function ScaleX (args) {
            return d3.time.scale().range([
                    0, args.width - args.margin.left - args.margin.right]);
        };


        function ScaleY (args) {

            return d3.scale.linear().range([
                    args.height - args.margin.top - args.margin.bottom, 0]);
        };


        function GridX (args) {

            return d3.select('#' + args.id + ' .grid-x')
                    .attr('transform', 'translate(' +
                        args.margin.left + ',' + args.height + ')');
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
                        (args.height - args.margin.bottom + 2) + ')');
        };


        function AxisY (args) {

            return d3.select('#' + args.id + ' .y-axis')
                .attr('transform', 'translate(' +
                    args.margin.left + ',' + args.margin.top + ')');
        };


        function Curtain (args) {

            return d3.select('#' + args.id + ' .hideAnimeLine')
                .attr('width', args.margin.left - 1)
                .attr('height',args.height + args.margin.top);
        };


        function AxisLineX (args) {

            return d3.select('#' + args.id + ' .axisLine.x')
                .attr('x1', args.margin.left)
                .attr('y1', args.height - args.margin.bottom + 2)
                .attr('x2', args.width + args.margin.left + args.margin.right)
                .attr('y2', args.height - args.margin.bottom + 2);
        };


        function AxisLineY (args) {

            return d3.select('#' + args.id + ' .axisLine.y')
                .attr('x1', args.margin.left)
                .attr('y1', 0)
                .attr('x2', args.margin.left)
                .attr('y2', args.height - args.margin.bottom + 3);
        };


        function ValueLine (args) {

            return d3.svg.line()
                    .x(function(d) {return args.scale.x(d.time); })
                    .y(function(d) {return args.scale.y(d.value); })
                    .defined(function(d) {return d.value != null })
                    .interpolate('monotone');
        };


        function ValueArea (args) {

            return d3.svg.area()
                    .x(function(d) {return args.scale.x(d.time); })
                    .y1(function(d) {return args.scale.y(d.value); })
                    .y0(args.height - args.margin.top - args.margin.bottom)
                    .defined(function(d) {return d.value != null })
                    .interpolate('monotone');
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

                    var that = this;

                    var frame = 0;
                    var intervalTime = 1000 / this.fps;

                    var start = d3.transform('translate(' +
                        (this.startPoint.x || 0) + ',' + this.startPoint.y + ')');
                    var stop = d3.transform('translate(' +
                        (this.stopPoint.x || 0) + ',' + this.stopPoint.y  + ')');
                    var interpolate = d3.interpolateTransform(start,stop);

                    // Initial Start
                    this.d3Selector.attr('transform', interpolate(0));

                    // TODO: This interval should not be that
                    // deep into the code.

                    // Create Interval For The Animation
                    var animation_interval = window.setInterval(function () {

                        frame++;

                        // Get transform Value and aply it to the DOM
                        var transformValue = interpolate(
                            frame / (that.fps * that.duration));

                        that.d3Selector.attr('transform', transformValue);

                        // Check if animation should stop
                        if(frame >= that.fps * that.duration || that.stopFlag){

                            // Make sure transform is in the final form
                            //var transformValue = interpolate(1);
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
                if ((typeof stopCurrent == 'undefined' || stopCurrent) && buffer.length > 0 ) {
                    buffer[0].stop();
                }

                buffer = Buffer(bufferSize);
            }

            var buffer = new Buffer(bufferSize); // The buffer that keeps the animation instances
            var current_animation = new _Animation();   // The animation instance where all the changes occur
        };

        function labelTicksFixed (axisInstance, format, timeDisplayed) {

            // Check Time Displayed
            var labelStep;
            if(timeDisplayed <= 600)           // 10 Minutes (10*60)
                axisInstance.ticks(d3.time.minutes,2);
            else if(timeDisplayed <= 3600)     // 1 Hour (1*60*60)
                axisInstance.ticks(d3.time.minutes,12);
            else if(timeDisplayed <= 86400)    // 1 Day (24*60*60)
                axisInstance.ticks(d3.time.hours,6);
            else if(timeDisplayed <= 604800)   // 1 Week (7*24*60*60)
                axisInstance.ticks(d3.time.days,1);
            else if(timeDisplayed <= 18144000) // 1 Month (30*7*24*60*60)
                axisInstance.ticks(d3.time.days,7);

            if (format)
                axisInstance.tickFormat(d3.time.format(format));

            return axisInstance;
        };

        // These are some functions that used to be anonymous
        // and weere passed to d3 functions all the time.
        // So we cache them to save some cpu usage
        function getDatapointValue (d) {
            return d.value;
        }
        function getDatapointTime (d) {
            return d.time;
        }
    }
);
