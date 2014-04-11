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


            deleteMetric: function (metric, callback) {
                var that = this;
                this.set('deletingMetric', true);
                Mist.ajax.DELETE('/metrics/' + metric.id, {
                }).success(function() {
                    that._deleteMetric(metric);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to delete metric: ' + message);
                }).complete(function(success) {
                    that.set('deletingMetric', false);
                    if (callback) callback(success, metric);
                });
            },


            setCustomMetrics: function(metrics) {
                Ember.run(this, function() {
                    for (var metricId in metrics) {
                        metrics[metricId].id = metricId;
                        this.customMetrics.pushObject(
                            metrics[metricId]
                        );
                    }
                    this.trigger('onMetricListChange');
                });
            },


            setBuiltInMetrics: function(metrics) {
                Ember.run(this, function() {
                    for (var metricId in metrics) {
                        metrics[metricId].id = metricId;
                        this.builtInMetrics.pushObject(
                            metrics[metricId]
                        );
                    }
                    this.trigger('onMetricListChange');
                });
            },


            _addMetric: function (metric, machine) {
                Ember.run(this, function () {
                    this.customMetrics.pushObject(metric);
                    this.trigger('onMetricAdd');
                    this.trigger('onMetricListChange');
                });
            },


            _deleteMetric: function (metric) {
                Ember.run(this, function () {
                    this.customMetrics.removeObject(
                        this.customMetrics.findBy('id', metric.id)
                    );
                    this.trigger('onMetricDelete');
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
