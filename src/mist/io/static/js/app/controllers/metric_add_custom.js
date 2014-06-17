define('app/controllers/metric_add_custom', ['app/models/metric', 'ember'],
    //
    //  Metric Add Custom Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        var newLine = String.fromCharCode(13);
        var SCRIPT_EXAMPLE =
            "import random" + newLine +
            "def read():" + newLine +
            "    return random.random()" + newLine;

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            view: null,
            machine: null,
            callback: null,
            formReady: null,
            addingMetric: null,

            metric: {
                name: null,
                unit: null,
                type: null,
                target: null,
                script: null,
                minValue: null,
                maxValue: null,
            },


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
            },


            close: function () {
                if (this.callback)
                    this.callback(false);
                this.clear();
                this.view.close();
            },


            clear: function () {
                this.view.clear();
                this.set('machine', null)
                    .set('callback', null)
                    .set('metric', Ember.Object.create({
                        'name': null,
                        'unit': null,
                        'type': null,
                        'target': null,
                        'script': SCRIPT_EXAMPLE,
                        'minValue': null,
                        'maxValue': null,
                    }))
                    .set('addingMetric', null);
            },


            add: function () {

                var url = '/backends/' + this.machine.backend.id +
                          '/machines/' + this.machine.id + '/deploy_plugin';

                this.metric.set('plugin_type', $('#plugin-type').val());
                var that = this;
                this.set('addingMetric', true);
                Mist.ajax.POST(url, {
                    'name'          : this.metric.name,
                    'unit'          : this.metric.unit,
                    'plugin_type'   : this.metric.type,
                    'target'        : this.metric.target,
                    'read_function' : this.metric.script,
                    'min_value'     : this.metric.minValue,
                    'max_value'     : this.metric.maxValue,
                }).error(function (message) {
                    Mist.notificationController.notify('Failed to deploy ' +
                        'custom plugin: ' + message);
                }).complete(function (success, data) {
                    if (that.callback) that.callback(success, data);
                    that.set('addingMetric', false);
                    that.close();
                });
            },


            //
            //
            //  Observers
            //
            //


            metricObserver: function () {
                this.set('formReady',
                    this.metric.name && this.metric.script);
            }.observes('metric.name', 'metric.script')
        });
    }
);
