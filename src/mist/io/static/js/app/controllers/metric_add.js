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
            newMetricName: null,
            newMetricTarget: null,


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
                    'name': this.newMetricName,
                    'target': this.newMetricTarget
                }, function (success) {
                    if (success)
                        that.close();
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
                    .set('newMetricName', null)
                    .set('newMetricTarget', null);
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
                if (this.newMetricTarget &&
                    this.newMetricName) {
                        this.set('formReady', true);
                } else {
                    this.set('formReady', false);
                }
            }.observes('newMetricTarget', 'newMetricName')
        });
    }
);
