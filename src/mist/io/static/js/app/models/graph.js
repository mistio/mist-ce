define('app/models/graph', ['ember'],
    //
    //  Graph Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        var MAX_BUFFER_DATA = 60;

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            view: null,

            id: null,
            unit: null,
            title: null,
            metrics: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('metrics', []);
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            getMetric: function(metricId) {
                return this.metrics.findBy('id', metricId);
            },


            hasMetric: function (metricId) {
                return !!this.getMetric(metricId);
            },


            addMetric: function (metric) {
                Ember.run(this, function () {
                    this.metrics.pushObject(metric);
                    this.trigger('onMetricAdd');
                    this.trigger('onDataUpdate', metric.datapoints);
                });
            },


            removeMetric: function (metricId) {
                Ember.run(this, function () {
                    this.metrics.removeObject(
                        this.getMetric(metricId)
                    );
                    this.trigger('onMetricRemove');
                });
            },


            updateData: function (data) {
                Ember.run(this, function () {
                    for (var metricId in data) {
                        var metric = this.getMetric(metricId);
                        if (metric) {
                            metric.datapoints.addObjects(data[metricId]);
                            var datapoints = metric.datapoints;
                            if (datapoints.length > MAX_BUFFER_DATA * 2) {
                                // If we don't multiply by two, the code will
                                // end up trimming a single datapoint on each
                                // update, which consumes resources for nothing
                                var spare = datapoints.length - MAX_BUFFER_DATA;
                                metric.datapoints = datapoints.slice(spare);
                            }
                        }
                    }
                    this.trigger('onDataUpdate', this.metrics[0].datapoints);
                });
            }
        });
    }
);
