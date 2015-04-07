define('app/controllers/monitoring', ['app/models/graph', 'app/models/metric', 'ember'],
    //
    //  Monitoring Controller
    //
    //  @returns Class
    //
    function(Graph, Metric) {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            checkingMonitoring: null,


            //
            //
            //  Initialization
            //
            //


            load: function(callback) {
                if (!Mist.authenticated) {
                    Mist.backendsController.set('checkedMonitoring', true);
                    return;
                }
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            enableMonitoring: function(machine, callback, noSsh) {

                var that = this;
                machine.set('enablingMonitoring', true);

                var url = '/backends/' + machine.backend.id +
                    '/machines/' + machine.id + '/monitoring';

                Mist.ajax.POST(url, {
                    'action': 'enable',
                    'no_ssh': noSsh || false,
                    'name': machine.name || machine.id,
                    'public_ips': machine.public_ips || [],
                    'dns_name': machine.extra.dns_name || 'n/a',
                }).success(function(data) {
                    Mist.set('authenticated', true);
                    that._enableMonitoring(machine);
                }).error(function(message, statusCode) {

                    if (statusCode == 402)
                        Mist.notificationController.timeNotify(message, 5000);
                    else
                        Mist.notificationController.notify(
                            'Error when changing monitoring to ' + machine.name);

                }).complete(function(success, data) {
                    machine.set('enablingMonitoring', false);
                    if (callback) callback(success, data);
                });
            },


            disableMonitoring: function(machine, callback) {

                var that = this;
                machine.set('disablingMonitoring', true);
                machine.set('hasMonitoring', false);

                var url = '/backends/' + machine.backend.id +
                    '/machines/' + machine.id + '/monitoring';

                Mist.ajax.POST(url, {
                    'action': 'disable',
                    'name': machine.name || machine.id,
                    'public_ips': machine.public_ips || [],
                    'dns_name': machine.extra.dns_name || 'n/a',
                }).success(function(data) {
                    Mist.set('authenticated', true);
                    that._disableMonitoring(machine);
                }).error(function(message, statusCode) {

                    machine.set('hasMonitoring', true);
                    if (statusCode == 402)
                        Mist.notificationController.timeNotify(message, 5000);
                    else
                        Mist.notificationController.notify(
                            'Error when changing monitoring to ' + machine.name);

                }).complete(function(success, data) {
                    machine.set('disablingMonitoring', false);
                    if (callback) callback(success, data);
                });
            },


            changeMonitoring: function(machine, callback) {
                if (machine.hasMonitoring)
                    this.disableMonitoring(machine, callback);
                else
                    this.enableMonitoring(machine, callback);
            },


            _enableMonitoring: function (machine) {
                Ember.run(this, function () {
                    machine.set('hasMonitoring', true);
                    machine.set('pendingFirstData', true);
                    this.trigger('onMonitoringEnable', machine);
                });
            },


            _disableMonitoring: function (machine) {
                Ember.run(this, function () {
                    machine.set('hasMonitoring', false);
                    Mist.monitored_machines.some(function(machine_tupple) {
                        if (machine.equals(machine_tupple))
                            Mist.monitored_machines.removeObject(machine_tupple);
                    });
                    this.trigger('onMonitoringDisable', machine);
                });
            },


            _updateMonitoringData: function(data) {

                Mist.set('current_plan', data.current_plan);
                Mist.set('monitored_machines', data.machines);
                Mist.set('monitored_machines_', data.monitored_machines);

                Mist.metricsController.setCustomMetrics(data.custom_metrics);
                Mist.metricsController.setBuiltInMetrics(data.builtin_metrics);
                Mist.rulesController.setContent(data.rules);

                Mist.backendsController.content.forEach(function (backend) {
                   backend.machines._updateMonitoredMachines();
                });
            },


            getMonitoringCommand: function (machine, callback) {

                var url = '/backends/' + machine.backend.id +
                    '/machines/' + machine.id + '/monitoring';

                var that = this;
                this.set('gettingCommand', true);
                Mist.ajax.POST(url, {
                    'action': 'enable',
                    'dns_name': machine.extra.dns_name ? machine.extra.dns_name : 'n/a',
                    'public_ips': machine.public_ips ? machine.public_ips : [],
                    'name': machine.name ? machine.name : machine.id,
                    'no_ssh': true,
                    'dry': true,
                }).success(function (data) {
                    that.set('command', data.command);
                }).error(function (message) {
                    Mist.notificationController.notify(
                        'Failed to enable monitoring: ' + message);
                }).complete(function (success, data) {
                    that.set('gettingCommand', false);
                    if (callback) callback(success, data);
                });
            },


            //
            //
            //  Cookies
            //
            //


            cookies: {


                timeWindow: null,
                collapsedGraphs: null,


                load: function () {

                    this.disableOldCookie();

                    if (document.cookie.indexOf('mistio-monitoring') == -1)
                        this.save();

                    var info = {};

                    // Seperate monitoring information out of
                    // cookie values

                    var values = document.cookie.split(';');

                    values.some(function (value) {
                        if (value.indexOf('mistio-monitoring=') > -1)
                            return info = JSON.parse(
                                value.replace('mistio-monitoring=', ''));
                    });

                    this.timeWindow = info.timeWindow || 600000;
                    this.collapsedGraphs = info.collapsedGraphs || [];
                },


                save: function (metrics) {

                    var cookieExpire = new Date();
                    cookieExpire.setFullYear(cookieExpire.getFullYear() + 2);

                    var cookie = "mistio-monitoring=" + JSON.stringify({
                        timeWindow: this.timeWindow,
                        collapsedGraphs: this.collapsedGraphs
                    }) +
                    '; expires=' + cookieExpire.toUTCString() +
                    '; path=/';

                    document.cookie = cookie;
                },


                disableOldCookie: function () {
                    if (document.cookie.indexOf('collapsedGraphs') > -1)
                        document.cookie = 'collapsedGraphs=;' +
                            'expires=Thu, 01 Jan 1970 00:00:01 GMT';
                }
            }
        })
    }
);
