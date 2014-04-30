define('app/views/graph', ['app/views/templated'],
    //
    //  Graph View
    //
    //  @returns Class
    //
    function(TemplatedView) {

        //'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graph: null,
            d3elements: {},


            //
            //
            //  Initialization
            //
            //


            load: function () {

                this.graph.on('onDataUpdate', this, 'drawGraph');
                this.graph.on('onMetricAdd', this, 'renderGraph');
                this.graph.on('onMetricRemove', this, 'renderGraph');

                //this.renderGraph();
                this.drawGraph();

            }.on('didInsertElement'),


            unload: function () {

                this.graph.off('onDataUpdate', this, 'drawGraph');
                this.graph.off('onMetricAdd', this, 'renderGraph');
                this.graph.off('onMetricRemove', this, 'renderGraph');

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            drawGraph: function () {
                Ember.run(this, function () {

                    try {
                        if (d3) {}
                    } catch (e) {
                        d3 = require('d3');
                    }

                    this.set('width', $("#GraphsArea").width() -2);
                    this.set('height', this.width * 0.125);

                    var size = {
                        height: this.height,
                        width: this.width
                    }

                    var dataMaxTime = 0;
                    var dataMaxValue = 0;

                    this.graph.metrics.forEach(function (metric) {
                        metric.datapoints.forEach(function (datapoint) {
                            if (datapoint.value > dataMaxValue)
                                dataMaxValue = datapoint.value;
                            if (datapoint.time > dataMaxTime)
                                dataMaxTime = datapoint.time;
                        });
                    });

                    var scale = {
                        x: d3.scale.linear().domain([0, dataMaxTime])
                            .range([0, size.width]),
                        y: d3.scale.linear().domain([0, dataMaxValue])
                            .range([size.height, 15])
                    }

                    $('#' + this.graph.id).find('svg').eq(0).addClass('prev');

                    var chart = d3.selectAll('#' + this.graph.id)
                       .append('svg:svg')
                       .data(this.graph.metrics)
                       .attr('width', size.width)
                       .attr('height', size.height)
                       .append('svg:g');

                    var line = d3.svg.area()
                        .x(function(d) {console.info(d); return scale.x(d.time);})
                        .y(function(d) {console.info(d); return scale.y(d.value);})
                        .y0(size.height).interpolate("basis");

                    var that = this;
                    this.graph.metrics.forEach(function (metric) {
                        chart.append('svg:path')
                            .attr('d', function(metric){return line(metric);});
                    });

                    $('#' + this.graph.id).find('svg.prev').eq(0).remove();
                });
            },

            renderGraph: function () {
                Ember.run(this, function () {

                    var newD3Elements = {};
                    var id = '#' + this.graph.id;


                    newD3Elements.svg = d3.selectAll(id)
                       .append('svg:svg')
                       .data(this.graph.metrics)
                       .attr('width', size.width)
                       .attr('height', size.height)
                       .append('svg:g');


                    newD3Elements.gridX = d3.select(id)
                        .select('svg')
                        .append('g')
                        .attr('class', 'grid-x');

                    newD3Elements.gridY = d3.select(id)
                        .select('svg')
                        .append('g')
                        .attr('class', 'grid-y');


                    newD3Elements.lines = [];
                    newD3Elements.areas = [];

                    this.graph.metrics.forEach(function (metric) {

                        var line = d3.svg.area()
                            .x(function(m,i){return scale.x(m.findById(metric.id)[i].time);})
                            .y(function(m,i){return scale.y(m.findById(metric.id)[i].value);})
                            .y0(size.height).interpolate("basis");

                        newD3Elements.lines.push(line);
/*
                        newD3Elements.areas.push(
                            newD3Elements.svg
                                .append('g')
                                .attr('class','valueArea')
                                .append('path')
                        );*/
                    });

                    this.set('d3elements', newD3Elements);
                });
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
    }
);
