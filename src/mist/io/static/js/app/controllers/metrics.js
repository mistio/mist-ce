define('app/controllers/metrics', ['app/models/metric', 'ember'],
    //
    //  Metric Controller
    //
    //  @returns Class
    //
    function (Metric) {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


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
                }).success(function(data) {
                    metric.id = data.metric_id;
                    metric.name = metric.newName;
                    metric.machines = machine ? [machine] : [];
                    that._addMetric(metric, machine);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to add metric: ' + message);
                }).complete(function (success, data) {
                    that.set('addingMetric', false);
                    if (callback) callback(success, that.getMetric(data.metric_id));
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
                            Metric.create(metrics[metricId])
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
                            Metric.create(metrics[metricId])
                        );
                    }
                    this.trigger('onMetricListChange');
                });
            },


            getMetric: function (id) {
                var result = this.builtInMetrics.findBy('id', id);
                if (!result)
                    result = this.customMetrics.findBy('id', id);
                return result;
            },


            getMetricByTarget: function (target) {
                var result = this.builtInMetrics.findBy('target', target);
                if (!result)
                    result = this.customMetrics.findBy('target', target);
                return result;
            },


            _addMetric: function (metric, machine) {
                Ember.run(this, function () {
                    this.customMetrics.pushObject(Metric.create(metric));
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
