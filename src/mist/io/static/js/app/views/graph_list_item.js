define('app/views/graph_list_item', ['app/views/templated', 'd3', 'c3'],
    //
    //  Graph View
    //
    //  @returns Class
    //
    function (TemplatedView, d3, c3) {

        'use strict';

        var ANIMATION_FPS = 12;
        var ANIMATION_DURATION = 9;

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
                if (!this.get('chart')) {
                    this.set('chart', c3.generate({
                        bindto: '#' + this.graph.id,
                        data: {
                            columns: this.graph.datasources.map(function (datasource) {
                                var ret = datasource.datapoints.map(function (datapoint) {
                                    return datapoint.value;
                                });
                                ret.unshift(datasource.metric.id);
                                return ret;
                            })
                            //columns: [
                            //        ['data1', 30, 200, 100, 400, 150, 250],
                            //        ['data2', 50, 20, 10, 40, 15, 25]
                            //    ],
                        },
                        axis: {
                            y: {
                                label: {
                                    text: 'Yolo',
                                    position: 'outer-middle'
                                },
                            },
                        }
                    }));
                } else {
                    this.get('chart').flow({
                        columns:  this.graph.datasources.map(function (datasource) {
                            return [
                                datasource.metric.id,
                                datasource.datapoints[datasource.datapoints.length -1].value
                            ];
                        }),
                    });
                }
            },

            valueText: function(currentValue){
                if(currentValue>=1073741824)                               // (1024*1024*1024)
                    return (currentValue/1073741824).toFixed(2) +'G'; // (1024*1024*1024)
                else if(currentValue>=1048576)                             // (1024*1024)
                    return (currentValue/1048576).toFixed(2) +'M';    // (1024*1024)
                else if(currentValue>=1024)
                    return (currentValue/1024).toFixed(2) + 'K';
                else
                    return currentValue.toFixed(2);
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
                if (this.isHidden)
                    $('#' + this.id).parent().hide(400);
                else if (this.isHidden !== undefined) {
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
