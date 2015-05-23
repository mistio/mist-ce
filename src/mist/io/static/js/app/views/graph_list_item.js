define('app/views/graph_list_item', ['app/views/templated', 'd3', 'c3'],
    //
    //  Graph View
    //
    //  @returns Class
    //
    function (TemplatedView, d3, c3) {

        'use strict';

        return App.GraphListItemView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graph: null,

            unit: null,
            isHidden: null,
            actionProxy: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                Ember.run.next(this, function () {
                    this.graph.set('view', this);
                });

            }.on('didInsertElement'),


            unload: function () {

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //

            draw: function () {
                var graph = this.graph,
                    chart = this.get('chart');

                if (!graph.datasources || !graph.datasources.length)
                    return;

                var source0 = graph.datasources[0],
                    unit = source0.metric.unit,
                    lastpoint = source0.datapoints[source0.datapoints.length-1];

                // prepare x axis column
                var x = ['x'].pushObjects(source0.datapoints.map(
                    function(point) { return point.time }
                ));

                // prepare other columns
                var cols = [x].pushObjects(this.graph.datasources.map(
                    function (datasource) {
                        var ret = datasource.datapoints.map(function (datapoint) {
                            return datapoint.value;
                        });
                        ret.unshift(datasource.metric.id);
                        return ret;
                    }
                ))

                if (!this.get('chart')) { // generate new chart
                    this.set('chart', c3.generate({
                        bindto: '#' + graph.id,
                        data: {
                            x: 'x',
                            columns: cols,
                            type: 'area-spline'
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                tick: {
                                    format: '%H:%M',
                                    count: 5
                                },
                                padding: {
                                    left: 0,
                                    right: 0
                                }
                            },
                            y: {
                                label: {
                                    text: unit,
                                    position: 'inner-top'
                                },
                                tick: {
                                    format: function(val) {
                                        return graph.valueText(val)
                                    }
                                }
                            }
                        },
                        point: {
                            r: 0,
                            focus: {
                                expand: {
                                    r: 3
                                }
                            }
                        },
                        line: {
                            connectNull: false
                        },
                        tooltip: {
                            format: {
                                title: function(x) { return x.toTimeString(); },
                                value: function (value, ratio, id, index) {
                                    return graph.valueText(value) + unit;
                                }
                            }
                        },
                        legend: {
                            position: 'top'
                        }
                    }));
                } else { // stream new datapoints on existing chart
                    // Only add values that are not already in the chart
                    var lastx = chart.data.shown()[0].values.slice(-1)[0].x;
                    for (var i=0; i < x.length; i++) {
                        if (x[x.length-1-i]<=lastx)
                            break
                    }
                    if (i > 0 ){
                        var newcols = []
                        cols.forEach(function(col) {
                            newcols.push([col[0]].pushObjects(col.slice(0-i)))
                        });
                    }
                    chart.flow({
                        duration: 250,
                        length: i,
                        columns: newcols
                    });
                }
            },


            clearData: function () {
                this.graph.datasources.forEach(function (datasource) {
                    datasource.clear();
                });
            },


            enableAnimation: function () {
                this.set('animationEnabled', true);
            },


            //
            //
            //  Observers
            //
            //


            isStreamingObserver: function () {
                return; // TODO: fixme
                if (Mist.graphsController.stream.isStreaming)
                    this.enableAnimation();
                else
                    this.disableAnimation(true);
            }.observes('Mist.graphsController.stream.isStreaming'),


            isVisibleObserver: function () {
                if (this.isHidden){
                    warn('hiding', $('#' + this.id).parent());
                    $('#' + this.id).parent().hide(400);
                } else if (this.isHidden !== undefined) {
                    $('#' + this.id).parent().show(400);
                    this.draw();
                }
            }.observes('isHidden'),


            isEmptyObserver: function () {
                if (this.graph.isEmpty)
                    $('#' + this.id).parent().hide(500);
                else
                    $('#' + this.id).parent().show(500);
            }.observes('graph.isEmpty'),


            fetchingStatsObserver: function () {
                return; //TODO fixme
                Ember.run.once(this, function () {
                    if (Mist.graphsController.fetchingStats &&
                        (!Mist.graphsController.stream.isStreaming ||
                        Mist.graphsController.stream.firstStreamingCall))
                            this.showFetchingStats();
                    else
                        this.hideFetchingStats();
                });
            }.observes('Mist.graphsController.fetchingStats',
                'Mist.graphsController.stream.isStreaming',
                'Mist.graphsController.stream.firstStreamingCall'),
        });
    }
);
