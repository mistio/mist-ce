define('app/views/machine_monitoring', ['app/views/templated', 'app/models/graph'],
    //
    //  Machine Monitoring View
    //
    //  @returns Class
    //
    function (TemplatedView, Graph) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            machine: null,
            gettingCommand: null,


            //
            //
            //  Initialization
            //
            //


            unload: function () {

                // Remove event handlers
                Mist.metricsController.off('onMetricAdd', this, '_checkNewMetric');
                this._hideGraphs();

            }.on('willDestroyElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                enableMonitoringClicked: function () {

                    // Make sure user is logged in
                    if (!Mist.authenticated)
                        Mist.loginController.open();

                    // Make sure user has purchased a plan
                    else if (!Mist.current_plan)
                        this._showMissingPlanMessage();

                    // Make sure machine has a key
                    else if (!this.machine.probed)
                        this._showManualMonitoringCommand();

                    // Confrim to enable monitoring
                    else
                        this._showEnableMonitoringConfirmation();
                },


                addMetricClicked: function () {
                    Mist.metricAddController.open(this.machine);
                }
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _showMissingPlanMessage: function () {
                Mist.dialogController.open({
                    type: DIALOG_TYPES.OK,
                    head: 'No plan',
                    body: [
                        {
                            paragraph: 'In order to use our monitoring' +
                                ' service you have to purchase a plan'
                        },
                        {
                            paragraph: 'You can do that in the Account' +
                                ' page, which can be accessed from the' +
                                ' menu button on the top right corner, or' +
                                ' you can the link bellow:'
                        },
                        {
                            link: 'Account page',
                            href: 'https://mist.io/account'
                        }
                    ]
                });
            },


            _showManualMonitoringCommand: function () {

                var that = this;
                this.set('gettingCommand', true);
                Mist.monitoringController.getMonitoringCommand(
                    this.machine, function (success, data) {
                        if (success)
                            showPopup(data.command);
                        that.set('gettingCommand', false)
                });

                function showPopup (command) {
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.OK_CANCEL,
                        head: 'Enable monitoring',
                        body: [
                            {
                                paragraph: 'Automatic installation of monitoring' +
                                    ' requires an SSH key'
                            },
                            {
                                paragraph: 'Run this command on your server for' +
                                    ' manual installation:'
                            },
                            {
                                command: command
                            },
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm)
                                Mist.monitoringController.enableMonitoring(
                                    that.machine, null, true
                                );
                        },
                    });
                }
            },


            _showEnableMonitoringConfirmation: function () {
                var machine = this.machine;
                Mist.dialogController.open({
                    type: DIALOG_TYPES.YES_NO,
                    head: 'Enable monitoring',
                    body: [
                        {
                            paragraph: 'Are you sure you want to enable' +
                                ' monitoring for this machine?'
                        }
                    ],
                    callback: function (didConfirm) {
                        if (didConfirm)
                            Mist.monitoringController.enableMonitoring(machine);
                    }
                });
            },


            _showGraphs: function () {

                if (Mist.graphsController.isOpen)
                    return;

                var machine = this.machine;
                var graphs = [];

                // Add built in graphs
                Mist.metricsController.builtInMetrics.forEach(function (metric) {
                    Mist.datasourcesController.addDatasource({
                        machine: machine,
                        metric: metric,
                        callback: function (success, datasource) {
                            graphs.push(Graph.create({
                                id: 'graph-' + parseInt(Math.random() * 10000),
                                title: metric.name,
                                datasources: [datasource],
                            }));
                        }
                    });
                });

                // Add custom graphs
                Mist.metricsController.customMetrics.forEach(function (metric) {
                    metric.machines.some(function (metricMachine) {
                        if (machine.equals(metricMachine)) {
                            Mist.datasourcesController.addDatasource({
                                machine: machine,
                                metric: metric,
                                callback: function (success, datasource) {
                                    graphs.push(Graph.create({
                                        id: 'graph-' + parseInt(Math.random() * 10000),
                                        title: metric.name,
                                        datasources: [datasource],
                                    }));
                                }
                            });
                            return true;
                        }
                    });
                });

                Mist.graphsController.open({
                    graphs: graphs,
                    config: {
                        canModify: true,
                        canControl: true,
                        canMinimize: true,
                    }
                });

                //Mist.metricsController.on('onMetricAdd', this, '_checkNewMetric');
            },


            _hideGraphs: function () {
                Mist.graphsController.close();
            },


            _checkNewMetric: function (metric, machine) {

                if (!Mist.graphsController.isOpen)
                    return;

                Mist.datasourcesController.addDatasource({
                    machine: machine,
                    metric: metric,
                    callback: function (success, datasource) {
                        if (success) {
                            Mist.graphsController.content.pushObject(Graph.create({
                                id: 'graph-' + parseInt(Math.random() * 10000),
                                title: metric.name,
                                datasources: [datasource],
                            }));
                        }
                    }
                });
            },


            //
            //
            //  Observers
            //
            //


            hasMonitoringObserver: function () {
                if (this.machine.hasMonitoring)
                    this._showGraphs();
                else
                    this._hideGraphs();
            }.observes('machine.hasMonitoring',
                'Mist.backendsController.checkedMonitoring')
        });
    }
);
