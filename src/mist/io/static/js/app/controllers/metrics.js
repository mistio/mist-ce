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


            content: [],


            //
            //
            //  Methods
            //
            //


            addMetric: function (machine, metric, callback) {
                var url = '/backends/' + machine.backend.id + '/machines/' +
                        machine.id + '/metrics';

                var that = this;
                this.set('addingMetric', true);
                Mist.ajax.POST(url, {
                    'name': metric.name,
                    'title': metric.title
                }).success(function(newMetric) {
                    that._addMetric(newMetric);
                }).error(function(message) {
                    Mist.notificationController.notify('Failed to add metric: ' + message);
                }).complete(function (success, newMetric) {
                    that.set('addingMetric', false);
                    if (callback) callback(success, newMetric);
                });
            },


            //
            //
            //  Actions
            //
            //


            _addMetric: function (metric) {
                Ember.run(this, function () {
                    this.content.pushObject(metric);
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
