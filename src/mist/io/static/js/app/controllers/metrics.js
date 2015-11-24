define('app/controllers/metrics', ['app/models/metric', 'ember'],
    //
    //  Metrics Controller
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
                var cloud_id = machine.cloud ? machine.cloud.id : null;

                var that = this;
                this.set('addingMetric', true);
                Mist.ajax.PUT('/metrics/' + metric.id, {
                    'name': metric.name,
                    'unit': metric.unit,
                    'machine_id': machine_id,
                    'cloud_id': cloud_id,
                }).success(function(data) {
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


            disableMetric: function (metric, machine, callback) {
                var machine_id = machine.id || null;
                var cloud_id = machine.cloud ? machine.cloud.id : null;
                var url = '/clouds/' + cloud_id +
                        '/machines/' + machine_id +
                        '/plugins/' + metric.pluginId;

                var that = this;
                this.set('disablingMetric', true);
                Mist.ajax.DELETE(url, {
                    'plugin_type': 'python',
                    'host': machine.getHost()
                }).success(function() {
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to disable metric: ' + message);
                }).complete(function(success) {
                    that.set('disablingMetric', false);
                    if (callback) callback(success, metric);
                });
            },

            disassociateMetric: function (metric, machine, callback) {

                var machine_id = machine.id || null;
                var cloud_id = machine.cloud ? machine.cloud.id : null;
                var url = '/clouds/' + cloud_id +
                        '/machines/' + machine_id +
                        '/metrics';

                var that = this;
                this.set('disassociatingMetric', true);
                Mist.ajax.DELETE(url, {
                    'metric_id': metric.id
                }).success(function(data) {
                    that._disassociateMetric(metric, machine);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Failed to disassociate metric: ' + message);
                }).complete(function (success, data) {
                    that.set('disassociatingMetric', false);
                    if (callback) callback(success, metric);
                });
            },


            setCustomMetrics: function (metrics) {
                this._updateCustomMetrics(metrics);
            },


            _updateCustomMetrics: function (metrics) {
                Ember.run(this, function() {

                    // Remove deleted metrics
                    this.customMetrics.forEach(function (metric) {
                        if (!metrics[metric.id])
                            this._deleteMetric(metric);
                    }, this);

                    forIn(this, metrics, function (metric, metricId) {

                        metric.id = metricId;

                        var oldMetric = this.getMetric(metricId);

                        if (oldMetric)
                            // Update existing metrics
                            forIn(metric, function (value, property) {
                                oldMetric.set(property, value);
                            });
                        else
                            // Add new metrics
                            this._addMetric(metric);
                    });

                    this.trigger('onMetricListChange');
                });
            },


            setBuiltInMetrics: function (metrics) {
                Ember.run(this, function() {
                    var newBuiltInMetrics = [];
                    for (var metricId in metrics) {
                        metrics[metricId].id = metricId;
                        newBuiltInMetrics.push(
                            Metric.create(metrics[metricId])
                        );
                    }
                    this.set('builtInMetrics', newBuiltInMetrics);
                    this.trigger('onMetricListChange');
                });
            },


            getMetric: function (id) {
                var result = this.builtInMetrics.findBy('id', id);
                if (!result)
                    result = this.customMetrics.findBy('id', id);
                return result;
            },


            isBuiltInMetric: function (id) {
                return !!this.builtInMetrics.findBy('id', id);
            },


            isCustomMetric: function (id) {
                return !!this.customMetrics.findBy('id', id);
            },


            _addMetric: function (metric, machine) {
                Ember.run(this, function () {
                    metric = Metric.create(metric);
                    this.customMetrics.addObject(metric);
                    this.trigger('onMetricAdd', {
                        metric: metric,
                        machine: machine,
                    });
                });
            },


            _disassociateMetric: function (metric, machine) {
                Ember.run(this, function () {
                    metric = this.getMetric(metric.id);
                    metric.machines.removeObject(machine);
                    this.trigger('onMetricDisassociate', {
                        metric: metric,
                        machine: machine,
                    });
                });
            },


            _deleteMetric: function (metric) {
                Ember.run(this, function () {
                    metric = this.customMetrics.findBy('id', metric.id);
                    this.customMetrics.removeObject(metric);
                    this.trigger('onMetricDelete', {
                        metric: metric
                    });
                    this.trigger('onMetricListChange');
                });
            }
        });
    }
);
