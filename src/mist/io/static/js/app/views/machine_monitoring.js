define('app/views/machine_monitoring',
    [
        'app/models/graph',
        'app/models/datasource',
        'app/models/stats_request'
    ],
    //
    //  Machine Monitoring View
    //
    //  @returns Class
    //
    function (Graph, Datasource, StatsRequest) {

        'use strict';

        return App.MachineMonitoringComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'machine_monitoring',
            rules: [],
            graphs: [],
            metrics: [],
            machine: null,
            gettingCommand: null,


            //
            //  Computed Properties
            //

            monitoringMessage: function () {
                var finishedAt = this.machine.installationStatus.finished_at;
                var activatedAt = this.machine.installationStatus.activated_at;
                var manual = this.machine.installationStatus.manual;

                // Machine has sent data to the monitoring server
                if (activatedAt)
                    return "Fetching monitoring data";

                // In case of manual installation or
                // when collectd has been installed but data1
                // haven't arrived yet
                if (manual || finishedAt)
                    return "Waiting for monitoring data";

                return "Installing collectd monitoring agent";
            }.property('machine.installationStatus.finished_at',
                'machine.installationStatus.activated_at'),


            //
            //  Initialization
            //

            load: function () {
                Mist.set('ma', this);
                // Add event handlers
                Mist.rulesController.on('onAdd', this, '_ruleAdded');
                Mist.rulesController.on('onUpdate', this, '_ruleUpdated');
                Mist.rulesController.on('onDelete', this, '_ruleDeleted');
                Mist.metricsController.on('onMetricAdd', this, '_metricAdded');
                Mist.metricsController.on('onMetricDelte', this, '_metricDeleted');
                Mist.metricsController.on('onMetricDisassociate', this, '_metricDeleted');
                Mist.graphsController.on('onFetchStats', this, '_analyzeStatsResponse');
            }.on('didInsertElement'),

            unload: function () {
                // Remove event handlers
                Mist.rulesController.off('onAdd', this, '_ruleAdded');
                Mist.rulesController.off('onUpdate', this, '_ruleUpdated');
                Mist.rulesController.off('onDelete', this, '_ruleDeleted');
                Mist.metricsController.off('onMetricAdd', this, '_metricAdded');
                Mist.metricsController.off('onMetricDelte', this, '_metricDeleted');
                Mist.metricsController.off('onMetricDisassociate', this, '_metricDeleted');
                Mist.graphsController.off('onFetchStats', this, '_analyzeStatsResponse');

                this._clear();
                this._hideGraphs();
            }.on('willDestroyElement'),

            showMonitoring: function () {
                this._clear();
                this._updateRules();
                var that = this;
                this._updateMetrics(function () {
                    that._updateGraphs();
                    that._showGraphs();
                });
            },

            hideMonitoring: function () {
                this._hideGraphs();
                this._clear();
            },


            //
            //  Methods
            //

            addGraphClicked: function () {
                Mist.metricAddController.open(this.machine);
            },


            //
            //  Actions
            //

            actions: {
                enableMonitoringClicked: function () {
                    // Make sure user is logged in
                    if (!Mist.authenticated)
                        Mist.loginController.open();

                    // Make sure user has purchased a plan
                    else if (!Mist.current_plan)
                        this._showMissingPlanMessage();

                    else if (!this.machine.probed || this.machine.get('isCoreos'))
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
                                paragraph: 'Are you sure you want to disable ' +
                                    'monitoring for this machine?'
                            }
                        ],
                        callback: disableMonitoring
                    });

                    function disableMonitoring (didConfirm) {
                        if (!didConfirm) return;

                        // Removing a bunch of graphs from the user's face
                        // feels clumpsy. So we scroll to top and present a
                        // nice message while disabling monitoring

                        Mist.smoothScroll(0, 50);

                        // Disable monitoring after a while to enalbe
                        // smoothScroll to scroll to top

                        Ember.run.later(function () {
                            Mist.monitoringController
                                .disableMonitoring(machine,
                                    function (success) {
                                        if (success)
                                            Mist.graphsController.close();
                                    }, !machine.probed
                                );
                        }, 200);
                    }
                },

                addRuleClicked: function() {
                    Mist.rulesController.newRule(this.machine);
                },


                //
                //  Proxy actions for graph list bar
                //

                addGraphClicked: function () {
                    this.addGraphClicked();
                },

                graphButtonClicked: function (graph) {
                    Mist.graphsController.model.removeObject(graph);
                    graph.set('isHidden', false);
                    Mist.graphsController.model.pushObject(graph);

                    // Update cookie
                    var entry = Mist.cookiesController.getSingleMachineGraphEntry(
                        this.machine, graph).hidden = false;
                    Mist.cookiesController.save();
                },


                //
                //  Proxy actions for graph list item
                //

                collapseClicked: function (graph) {
                    // Update cookie
                    // shift indexes and set this collapsed graph to be
                    // the last one
                    var graphs = Mist.cookiesController.getSingleMachineEntry(
                        this.machine).graphs;
                    var lastIndex = this.metrics.length - 1;
                    var e;
                    forIn(graphs, function (entry) {
                        if (entry.index == graph.index)
                            e = entry;
                        else if (entry.index > graph.index)
                            entry.index -= 1;
                    });
                    e.index = lastIndex;
                    e.hidden = true;
                    graph.set('index', lastIndex);
                    Mist.cookiesController.save();

                    Mist.graphsController.model.removeObject(graph);
                    graph.set('isHidden', true);
                    Ember.run.next(function(){
                        Mist.graphsController.model.pushObject(graph);
                    });
                },

                removeClicked: function (graph) {
                    var machine = this.machine;
                    var message = 'Are you sure you want to remove "' +
                        graph.datasources[0].metric.name + '"';
                    var metric = graph.datasources[0].metric;

                    if (metric.isPlugin)
                        message += ' and disable it from server ' + machine.name;
                    message += ' ?';

                    function removeGraph (success) {
                        if (success)
                            Mist.metricsController.disassociateMetric(
                                metric,
                                machine,
                                function (success) {
                                    if (success)
                                        Mist.graphsController.model.removeObject(graph);
                                }
                            );
                        else
                            graph.set('pendingRemoval', false);
                    }

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Remove graph',
                        body: [
                            {
                                paragraph: message
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                graph.set('pendingRemoval', true);
                                if (metric.isPlugin)
                                    Mist.metricsController.disableMetric(
                                        metric, machine, removeGraph);
                                else
                                    removeGraph(true);
                            }
                        }
                    })
                }
            },


            //
            //  Pseudo-Private Methods
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
                        if (success) {
                            if (that.machine.get('isWindows'))
                                showCommand({
                                    body: [
                                        {
                                            paragraph: 'Run this command on your server\'s power shell' +
                                                ' to install the monitoring agent:'
                                        },
                                        {
                                            command: data.windows_command
                                        }
                                    ]
                                });
                            else if (that.machine.get('isCoreos'))
                                showCommand({
                                    body: [
                                        {
                                            paragraph: 'Run this command on your server\'s terminal' +
                                                ' to install the monitoring agent:'
                                        },
                                        {
                                            command: data.coreos_command
                                        }
                                    ]
                                });
                            else
                                showCommand({
                                    body: [
                                        {
                                            paragraph: 'Automatic installation of the monitoring agent' +
                                                ' requires an SSH key'
                                        },
                                        {
                                            paragraph: 'Run this command on your server\'s terminal' +
                                                ' to install the monitoring agent:'
                                        },
                                        {
                                            command: data.unix_command
                                        }
                                    ]
                                });
                        }
                        that.set('gettingCommand', false)
                });

                function showCommand (args) {
                    Mist.dialogController.open({
                        size: 'large-modal',
                        type: DIALOG_TYPES.OK_CANCEL,
                        head: 'Enable monitoring',
                        body: args.body,
                        callback: function (didConfirm) {
                            if (!didConfirm) return;
                            Mist.monitoringController.enableMonitoring(
                                that.machine, null, true);
                        }
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
                    danger: false,
                    callback: function (didConfirm) {
                        if (didConfirm)
                            Mist.monitoringController.enableMonitoring(machine);
                    }
                });
            },

            _showGraphs: function () {
                if (!this.$())
                    return;

                var cookie = Mist.cookiesController
                    .getSingleMachineEntry(this.machine);

                if (Mist.graphsController.isOpen)
                    return;
                this.set('graphs', this.graphs.sortBy('index'));

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
                if (!Mist.graphsController.isOpen)
                    return;
                Mist.graphsController.close();
            },

            _updateRules: function () {
                Mist.rulesController.model.forEach(function (rule) {
                    if (this.machine.equals(rule.machine))
                        if (!this.rules.findBy('id', rule.id))
                            this.rules.pushObject(rule);
                }, this);
            },

            _updateMetrics: function (callback) {
                this.set('pendingFirstStats', true);
                var that = this;
                var request = StatsRequest.create({
                    from: Date.now(),
                    until: Date.now(),
                    datasources: [{machine: this.machine}]
                });
                function unhandleResponse () {
                    Mist.graphsController.off(
                        'onFetchStatsFromSocket',handleResponse);
                }
                function handleResponse (data) {
                    if (data.request_id == request.id) {
                        unhandleResponse();
                        if (Object.keys(data.metrics).length > 1) {
                            forIn(that, data.metrics, function (metric, target) {
                                var metric = Mist.metricsController.getMetric(target);
                                if (metric && !that.metrics.findBy('id', metric.id))
                                    that.metrics.pushObject(metric);
                            });
                            that.set('pendingFirstStats', false);
                            callback();
                        } else {
                            Ember.run.later(getStats, TIME_MAP.SECOND * 10);
                        }
                    }
                }
                function getStats () {
                    if (that.$()) {
                        Mist.graphsController.on(
                            'onFetchStatsFromSocket',handleResponse);
                        Mist.graphsController._fetchStatsFromSocket(request);
                    } else {
                        unhandleResponse();
                    }

                }
                getStats();
            },

            _updateGraphs: function () {
                var that = this;
                var ctlWasStreaming = Mist.graphsController.stream.isStreaming;
                var graphWasAdded = false;
                this.metrics.forEach(function (metric, index) {
                    var datasource = Datasource.create({
                        metric: metric,
                        machine: this.machine
                    });
                    var graphExists = false;
                    this.graphs.some(function (graph) {
                        if (graph.datasources.findBy('id', datasource.id))
                            return graphExists = true;
                    }, this);
                    if (!graphExists) {
                        graphWasAdded = true;
                        Mist.graphsController.stream.stop();
                        var newGraph = Graph.create({
                            title: metric.name,
                            index: index,
                            datasources: [datasource],
                        });
                        newGraph.set('isHidden', getGraphCookie(newGraph).hidden);
                        newGraph.set('index', getGraphCookie(newGraph).index);
                        this.graphs.pushObject(newGraph);
                    }
                }, this);
                if (ctlWasStreaming && graphWasAdded)
                    Mist.graphsController.stream.start();
                function getGraphCookie (graph) {
                    return Mist.cookiesController
                        .getSingleMachineGraphEntry(that.machine, graph);
                }
            },

            _analyzeStatsResponse: function (response) {
                Ember.run.later(this, function () {
                    forIn(this, response, function (metric, metricId) {
                        var metric = Mist.metricsController.getMetric(metricId);
                        if (metric && this.metrics && !this.metrics.findBy('id', metric.id))
                            this.metrics.pushObject(metric);
                    });
                }, TIME_MAP.SECOND);
            },

            _ruleAdded: function (event) {
                if (this.machine.equals)
                    if (this.machine.equals(event.object.machine))
                        this.rules.pushObject(event.object);
            },

            _ruleUpdated: function (event) {
                if (this.machine.equals)
                    if (this.machine.equals(event.object.machine)){
                        this.rules.findBy('id', event.object.id).update(event.object);
                    }
            },

            _ruleDeleted: function (event) {
                if (this.machine.equals)
                    if (this.machine.equals(event.object.machine))
                        this.rules.removeObject(event.object);
            },

            _metricAdded: function (event) {
                if (this.machine.equals)
                    if (this.machine.equals(event.machine))
                        this.metrics.pushObject(event.metric);
            },

            _metricDeleted: function (event) {
                if (this.metrics.findBy('id', event.metric.id))
                    this.metrics.removeObject(event.metric);
            },


            //
            //  Observers
            //

            hasMonitoringObserver: function () {
                if (this.machine.hasMonitoring){
                    Ember.run.next(this, function(){this.showMonitoring()});
                } else {
                    Ember.run.next(this, function(){this.hideMonitoring()});
                }
            }.observes('machine.hasMonitoring').on('didInsertElement'),

            metricsObsever: function () {
                Ember.run.once(this, '_updateGraphs');
            }.observes('metrics.[]'),
        });
    }
);
