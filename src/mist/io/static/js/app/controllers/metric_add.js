define('app/controllers/metric_add', ['ember'],
    //
    //  Metric Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            view: null,
            metrics: [],
            machine: null,
            callback: null,
            formReady: null,
            newMetric: null,


            //
            //
            //  Methods
            //
            //


            open: function (machine, callback) {
                this.clear();
                this.set('machine', machine)
                    .set('callback', callback);

                this.view.open();
                this.loadMetrics();
            },


            close: function () {
                this.clear();
                this.view.close();
            },


            add: function () {
                var that = this;
                Mist.metricsController.addMetric(this.machine, {
                    'name': this.newMetric.newName,
                    'target': this.newMetric.target
                }, function (success) {
                    if (success) {
                        if (that.callback) that.callback(that.newMetric);
                        that.close();
                    }
                });
            },


            loadMetrics: function () {
                var url = '/backends/' + this.machine.backend.id + '/machines/' +
                        this.machine.id + '/metrics';

                var that = this;
                this.set('loadingMetrics', true);
                Mist.ajax.GET(url, {
                }).success(function(metrics) {
                    that._setMetrics(metrics);
                }).error(function(message) {
                    Mist.notificationController.notify('Failed to load metrics: ' + message);
                }).complete(function() {
                    that.set('loadingMetrics', false);
                });
            },


            clear: function () {
                this.view.clear();
                this.set('metrics', [])
                    .set('machine', null)
                    .set('callback', null)
                    .set('newMetric', null);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _setMetrics: function (metrics) {
                // Currently useless, but we should create
                // a metric model at some point
                Ember.run(this, function () {
                    var newMetrics = [];
                    metrics.forEach(function(metric) {
                        newMetrics.push(metric);
                    });
                    this.set('metrics', newMetrics);
                });
            },


            //
            //
            //  Observers
            //
            //


            newMetricObserver: function () {
                if (this.newMetric &&
                    this.newMetric.target &&
                    this.newMetric.newName) {
                        this.set('formReady', true);
                } else {
                    this.set('formReady', false);
                }
            }.observes('newMetric.target', 'newMetric.newName', 'newMetric')
        });
    }
);
