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

            draw: function (reload) {
                var that = this,
                    graph = this.graph,
                    charts = this.get('charts') || [];

                if (!graph.datasources || !graph.datasources.length)
                    return;

                var source0 = graph.datasources[0],
                    maxpoints = 0;

                // Get the source with the max no of datapoints
                for (var i=0; i < graph.datasources.length; i++)
                    if (graph.datasources[i].datapoints.length > maxpoints)
                        source0 = graph.datasources[i];

                var unit = source0.metric.unit,
                    lastpoint = source0.datapoints[source0.datapoints.length-1];

                // prepare x axis column
                var x = ['x'].pushObjects(source0.datapoints.map(
                    function(point) { return point.time }
                ));

                graph.get('batches').forEach(function(batch, batchNo) {
                    // prepare other columns
                    var cols = [x].pushObjects(batch.body.map(
                        function (datasource) {
                            var ret = datasource.datapoints.map(function (datapoint) {
                                return datapoint.value;
                            });
                            if (graph.multi)
                                ret.unshift(datasource.machine.name)
                            else
                                ret.unshift(datasource.metric.id);
                            return ret;
                        }
                    ));

                    var chartType = 'area-spline';
                    if (graph.multi)
                        chartType = 'spline';
                    if (charts.length == batchNo) { // generate new chart
                        charts.push(c3.generate({
                            bindto: '#' + batch.id,
                            data: {
                                x: 'x',
                                columns: cols,
                                type: chartType,
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
                                    },
                                    min: 0,
                                    padding: {
                                        bottom: 0
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
                            }
                        }));
                        that.set('charts', charts);
                    } else if (Mist.graphsController.stream.isStreaming && !reload) { // stream new datapoints in existing chart
                        // Only add values that are not already in the chart
                        var lastx = null, maxLength=0;
                        try{ // maybe there are no datapoints shown on the chart
                            var shown = charts[batchNo].data(), jmax=0;
                            for (var j=0; j < shown.length; j++) {
                                if (shown[j].values.length > maxLength){
                                    jmax = j;
                                    maxLength = shown[j].values.length;
                                }
                            }
                            lastx = charts[batchNo].data.shown()[jmax].values.slice(-1)[0].x;
                        } catch(e) {}

                        if (!lastx) { // if chart emty and data load all columns
                            for (var z=0;z<cols.length; z++) {
                                if (cols[z].length>1){
                                    charts[batchNo].flow({
                                        columns: cols
                                    });
                                    break;
                                }
                            }
                        } else { // else stream only those that are not shown
                            for (var i=0; i < x.length; i++) {
                                if (lastx && x[x.length-1-i]<=lastx)
                                    break
                            }
                            if (i > 1){
                                var newcols = []
                                cols.forEach(function(col) {
                                    newcols.push([col[0]].pushObjects(col.slice(0-i)))
                                });
                            }
                            if (maxLength < MAX_DATAPOINTS ) {
                                i = 0; // Do not flow if not enough datapoints in chart
                            }
                            try {
                                charts[batchNo].flow({
                                    duration: 250,
                                    length: i,
                                    columns: newcols
                                });
                            } catch(e) {
                                error(e);
                            }
                        }
                    } else { // Update data in existing chart
                        charts[batchNo].load({
                            columns: cols
                        })
                    }
                });
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
                    warn('hiding', '#' + this.graph.id);
                    $('#' + this.graph.id).parent().hide(400);
                } else if (this.isHidden !== undefined) {
                    $('#' + this.graph.id).parent().show(400);
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
