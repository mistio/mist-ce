define('app/controllers/machine_metric_add', ['ember'],
    //
    //  Machine Metric Add Controller
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
            newMetricTitle: null,


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
                // An ajax call here
                // on success:
                this.close();
            },


            loadMetrics: function () {

                // Ajax call simulation
                /*
                this.set('loadingMetrics', true);
                Ember.run.later(this, function () {
                    this._setMetrics(this.TEMP_METRIC_LIST);
                    this.set('loadingMetrics', false);
                }, 2000);
                */

                var that = this;
                this.set('loadingMetrics', true);
                Mist.ajax.GET('/backends/' + this.machine.backend.id + '/machines/' +
                    this.machine.id + '/metrics', {
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
                    .set('newMetric', null)
                    .set('newMetricTitle', null);
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
                    this.newMetricTitle) {
                        this.set('formReady', true);
                } else {
                    this.set('formReady', false);
                }
            }.observes('newMetric', 'newMetricTitle'),


            // DEBUGGING ONLY!
            TEMP_METRIC_LIST: [
                'cpu.0.idle',
                'cpu.0.interrupt',
                'cpu.0.nice',
                'cpu.0.softirq',
                'cpu.0.steal',
                'cpu.0.system',
                'cpu.0.user',
                'cpu.0.wait',
                'df.dev.df_complex.free',
                'df.dev.df_complex.reserved',
                'df.dev.df_complex.used',
                'df.root.df_complex.free',
                'df.root.df_complex.reserved',
                'df.root.df_complex.used',
                'df.run.df_complex.free',
                'df.run.df_complex.reserved',
                'df.run.df_complex.used',
                'df.run-lock.df_complex.free',
                'df.run-lock.df_complex.reserved',
                'df.run-lock.df_complex.used',
                'df.run-shm.df_complex.free',
                'df.run-shm.df_complex.reserved',
                'df.run-shm.df_complex.used',
                'df.run-user.df_complex.free',
                'df.run-user.df_complex.reserved',
                'df.run-user.df_complex.used',
                'df.sys-fs-cgroup.df_complex.free',
                'df.sys-fs-cgroup.df_complex.reserved',
                'df.sys-fs-cgroup.df_complex.used',
                'disk.xvda1.disk_merged.read',
                'disk.xvda1.disk_merged.write',
                'disk.xvda1.disk_octets.read',
                'disk.xvda1.disk_octets.write',
                'disk.xvda1.disk_ops.read',
                'disk.xvda1.disk_ops.write',
                'disk.xvda1.disk_time.read',
                'disk.xvda1.disk_time.write',
                'interface.eth0.if_errors.rx',
                'interface.eth0.if_errors.tx',
                'interface.eth0.if_octets.rx',
                'interface.eth0.if_octets.tx',
                'interface.eth0.if_packets.rx',
                'interface.eth0.if_packets.tx',
                'interface.lo.if_errors.rx',
                'interface.lo.if_errors.tx',
                'interface.lo.if_octets.rx',
                'interface.lo.if_octets.tx',
                'interface.lo.if_packets.rx',
                'interface.lo.if_packets.tx',
                'load.longterm',
                'load.midterm',
                'load.shortterm',
                'memory.buffered',
                'memory.cached',
                'memory.free',
                'memory.used',
                'network.if_octets.rx',
                'network.if_octets.tx',
                'network.if_packets.rx',
                'network.if_packets.tx',
                'network.total_values.dispatch-accepted',
                'network.total_values.dispatch-rejected',
                'network.total_values.send-accepted',
                'network.total_values.send-rejected',
                'network.queue_length',
                'processes.ps_state.blocked',
                'processes.ps_state.paging',
                'processes.ps_state.running',
                'processes.ps_state.sleeping',
                'processes.ps_state.stopped',
                'processes.ps_state.zombies',
                'processes.fork_rate',
                'swap.swap_io.in',
                'swap.swap_io.out',
                'entropy',
                'users'
                ]
        });
    }
);
