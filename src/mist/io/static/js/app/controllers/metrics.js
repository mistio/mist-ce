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
                }).success(function(newMetricId) {
                    metric.id = newMetricId;
                    metric.name = metric.newName;
                    metric.machines = machine ? [machine] : [];
                    that._addMetric(metric, machine);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to add metric: ' + message);
                }).complete(function (success, newMetric) {
                    that.set('addingMetric', false);
                    if (callback) callback(success, newMetric);
                });
            },


            setCustomMetrics: function(metrics) {
                Ember.run(this, function() {
                    for (var metricId in metrics)
                        this.customMetrics.pushObject(
                            metrics[metricId]
                        );
                    this.trigger('onMetricListChange');
                });
            },


            setBuiltInMetrics: function(metrics) {
                Ember.run(this, function() {
                    for (var metricId in metrics)
                        this.builtInMetrics.pushObject(
                            metrics[metricId]
                        );
                    this.trigger('onMetricListChange');
                });
            },


            _addMetric: function (metric, machine) {
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
