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
        "import random" + newLine + newLine +
        "def read():" + newLine +
        "    # return random value" + newLine +
        "    return random.random()" + newLine;
        var SYNTAX_ERROR_INDENTIFIER = 'ERROR DEPLOYING PLUGIN';

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
                script: null,
                pluginId: null,
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


            close: function (noCallback) {
                if (this.callback && !noCallback)
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
                        'script': SCRIPT_EXAMPLE,
                        'pluginId': null,
                    }))
                    .set('addingMetric', null);
            },


            add: function () {

                var url = '/clouds/' + this.machine.cloud.id +
                          '/machines/' + this.machine.id +
                          '/plugins/' + this.metric.pluginId;

                var valueType = this.metric.type ? 'derive' : 'gauge';

                if (this.newMetricExists(this.metric, this.machine)) {
                    Mist.notificationController.notify('Metric "' +
                        this.metric.name + '" exists already.');
                    return;
                }

                var that = this;
                this.set('addingMetric', true);
                Mist.ajax.POST(url, {
                    'plugin_type'   : 'python',
                    'name'          : this.metric.name,
                    'unit'          : this.metric.unit,
                    'value_type'    : valueType,
                    'read_function' : this.metric.script,
                    'host'          : this.machine.getHost(),
                }).success(function (data) {
                    that.metric.id = data.metric_id;
                    that.metric.machines = that.machine ? [that.machine] : [];
                    Mist.metricsController._addMetric(that.metric, that.machine);
                }).error(function (message) {
                    if (that.handleSyntaxError(message))
                        return;
                    Mist.notificationController.notify('Failed to deploy ' +
                        'custom plugin: ' + message);
                }).complete(function (success, data) {
                    if (that.callback) that.callback(success, data);
                    that.set('addingMetric', false);
                    if (success)
                        that.close(true);
                });
            },


            generatePluginId: function () {

                if (!this.metric.name) return;

                var newPluginId = this.metric.name
                    .toLowerCase()           // Remove upper case letters
                    .replace(/[^\w]/g, '_')  // keep only alphanumeric and _ chars
                    .replace(/__*/g, '_')    // don't allow double underscores
                    .replace(/^_/, '')       // trim heading underscore
                    .replace(/_$/, '');      // trim trailing underscore

                this.metric.set('pluginId', newPluginId);
            },


            handleSyntaxError: function (error) {
                error = error.trim();
                var errorIndex = error.lastIndexOf(SYNTAX_ERROR_INDENTIFIER);
                if (errorIndex == error.length - SYNTAX_ERROR_INDENTIFIER.length) {
                    error = error.replace(SYNTAX_ERROR_INDENTIFIER, '')
                        .replace('Bad Request: ', '')
                        .trim();
                    $('#custom-plugin-error').slideDown().text(error);
                    $('#custom-plugin-script').focus();
                    return true;
                }
                return false;
            },


            newMetricExists: function (metric, machine) {
                var newMetricId = 'mist.python.' + this.metric.pluginId;
                var newMetric = Mist.metricsController.getMetric(newMetricId)
                if (newMetric && newMetric.hasMachine(machine))
                    return true;
                return false;
            },


            //
            //
            //  Observers
            //
            //


            metricObserver: function () {
                this.set('formReady',
                    this.metric.name && this.metric.script);
            }.observes('metric.name', 'metric.script'),


            nameObserver: function () {
                Ember.run.once(this, 'generatePluginId');
            }.observes('metric.name')
        });
    }
);
