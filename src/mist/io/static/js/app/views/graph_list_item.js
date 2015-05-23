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
                    datasource = graph.datasources.length && graph.datasources[0],
                    lastpoint = datasource.datapoints[datasource.datapoints.length-1];
                if (!this.get('chart')) {
                    var x = ['x'].pushObjects(datasource.
                                                datapoints.map(function(point){
                                                    return point.time
                                                }));
                    this.set('chart', c3.generate({
                        bindto: '#' + this.graph.id,
                        data: {
                            x: 'x',
                            columns: [x].pushObjects(this.graph.datasources.map(function (datasource) {
                                var ret = datasource.datapoints.map(function (datapoint) {
                                    return datapoint.value;
                                });
                                ret.unshift(datasource.metric.id);
                                return ret;
                            })),
                            type: 'area-spline'
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                label: {
                                    text: graph.valueText(lastpoint.value) + datasource.metric.unit,
                                    position: 'inner-right'
                                },
                                tick: {
                                    format: '%H:%M',
                                    count: 11
                                },
                                padding: {
                                    left: 0,
                                    right: 0
                                }
                            },
                            y: {
                                label: {
                                    text: datasource.metric.unit,
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
                                    return graph.valueText(value) + datasource.metric.unit;
                                }
                            }
                        }
                    }));
                } else {
                    var source = this.graph.datasources[0];
                    var x = ['x', source.datapoints[source.datapoints.length -1].time];
                    this.get('chart').flow({
                        duration: 100,
                        length: 1,
                        columns:  [x].pushObjects(this.graph.datasources.map(function (datasource) {
                            return [
                                datasource.metric.id,
                                lastpoint.value
                            ];
                        }))
                    });
                    if (lastpoint.value)
                        this.get('chart').axis.labels({'x': graph.valueText(lastpoint.value) + datasource.metric.unit});
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
