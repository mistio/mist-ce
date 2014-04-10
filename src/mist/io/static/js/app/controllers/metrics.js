define('app/controllers/metrics', ['ember'],
    //
    //  Metric Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            customMetrics: [],
            addingMetric: null,
            builtInMetrics: [],


            //
            //
            //  Methods
            //
            //


            addMetric: function (machine, metric, callback) {

                var machine_id = machine.id || null;
                var backend_id = machine.backend ? machine.backend.id : null;

                var that = this;
                this.set('addingMetric', true);
                Mist.ajax.POST('/metrics', {
                    'name': metric.newName,
                    'target': metric.target,
                    'machine_id': machine_id,
                    'backend_id': backend_id,
                }).success(function(newMetric) {
                    that._addMetric(newMetric);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to add metric: ' + message);
                }).complete(function (success, newMetric) {
                    that.set('addingMetric', false);
                    if (callback) callback(success, newMetric);
                });
            },


            setCustomMetrics: function(metrics) {
                var that = this;
                Ember.run(function() {
                    for (var metricId in metrics)
                        that.customMetrics.pushObject(
                            metrics[metricId]
                        );
                });
            },


            setBuiltInMetrics: function(metrics) {
                var that = this;
                Ember.run(function() {
                    for (var metricId in metrics)
                        that.builtInMetrics.pushObject(
                            metrics[metricId]
                        );
                });
            },


            _addMetric: function (metric) {
                Ember.run(this, function () {
                    this.customMetrics.pushObject(metric);
                    this.trigger('onMetricAdd');
                    this.trigger('onMetricListChange');
                });
            }


            //
            //
            //  Observers
            //
            //


        });
    }
);
