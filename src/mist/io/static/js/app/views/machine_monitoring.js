define('app/views/machine_monitoring',
    [
        'app/views/templated',
        'app/models/graph',
        'app/models/datasource'
    ],
    //
    //  Machine Monitoring View
    //
    //  @returns Class
    //
    function (TemplatedView, Graph, Datasource) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            rules: [],
            graphs: [],
            metrics: [],
            machine: null,
            gettingCommand: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this._clear();
            }.on('didInsertElement'),


            unload: function () {
                this._clear();
                this._hideGraphs();
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            addGraphClicked: function () {
                Mist.metricAddController.open(this.machine);
            },


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


                disableMonitoringClicked: function () {
                    var machine = this.machine;
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Disable monitoring',
                        body: [
                            {
                                paragraph: 'Are you sure you want to disable' +
                                    'monitoring for this machine?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm)
                                Mist.monitoringController
                                    .disableMonitoring(machine,
                                        function (success) {
                                            if (success)
                                                Mist.graphsController.close();
                                        }
                                    );
                        }
                    });
                },


                addRuleClicked: function() {
                    Mist.rulesController.newRule(this.machine);
                },
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    rules: new Array(),
                    graphs: new Array(),
                    metrics: new Array(),
                });
            },


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

                Mist.graphsController.open({
                    graphs: this.graphs,
                    config: {
                        canModify: true,
                        canControl: true,
                        canMinimize: true,
                    }
                });
            },


            _hideGraphs: function () {
                Mist.graphsController.close();
            },



            _updateRules: function () {
                Mist.rulesController.content.forEach(function (rule) {
                    if (this.machine.equals(rule.machine))
                        if (!this.rules.findBy('id', rule.id))
                            this.rules.pushObject(rule);
                }, this);
            },


            _updateMetrics: function () {
                Mist.metricsController.builtInMetrics.forEach(function (metric) {
                    if (!this.metrics.findBy('id', metric.id))
                        this.metrics.pushObject(metric);
                }, this);
                Mist.metricsController.customMetrics.forEach(function (metric) {
                    if (metric.hasMachine(this.machine) &&
                        !this.metrics.findBy('id', metric.id)) {
                            this.metrics.pushObject(metric);
                    }
                }, this);
            },


            _updateGraphs: function () {
                this.metrics.forEach(function (metric) {
                    var datasource = Datasource.create({
                        metric: metric,
                        machine: this.machine
                    });
                    var graphExists = false;
                    this.graphs.some(function (graph) {
                        if (graph.datasources.findBy('id', datasource.id))
                            return graphExists = true;
                    }, this);
                    if (!graphExists)
                        this.graphs.pushObject(Graph.create({
                            title: metric.name,
                            datasources: [datasource]
                        }));
                }, this);
                this._showGraphs();
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
                'Mist.backendsController.checkedMonitoring'),


            rulesObserver: function () {
                Ember.run.once(this, '_updateRules');
            }.observes('Mist.rulesController.content.@each'),


            metricsObsever: function () {
                Ember.run.once(this, '_updateMetrics');
                Ember.run.once(this, '_updateGraphs');
            }.observes('Mist.metricsController.builtInMetrics.@each',
                'Mist.metricsController.customMetrics.@each'),
        });
    }
);
