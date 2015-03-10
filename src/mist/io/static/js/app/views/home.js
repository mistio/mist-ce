define('app/views/home', ['app/views/mistscreen', 'app/models/graph'],
    //
    //  Home View
    //
    //  @returns Class
    //
    function (PageView, Graph) {

        'use strict';

        return App.HomeView = PageView.extend({


            //
            //
            //  Initialization
            //
            //


            load: function () {
                Ember.run.next(this, function () {
                    this.checkedMonitoringObserver();
                });
                Mist.backendsController.on('onMachineListChange', this,
                    'checkedMonitoringObserver');
            }.on('didInsertElement'),


            unload: function () {
                Mist.graphsController.close();
                Mist.backendsController.off('onMachineListChange', this,
                    'checkedMonitoringObserver');
            }.on('willDestroyElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                addBackend: function () {
                    Mist.backendAddController.open();
                },

                incidentClicked: function (incident) {
                    Mist.Router.router.transitionTo('machine', incident.get('machine'));
                }
            },


            //
            //
            //  Methods
            //
            //

            showGraphs: function () {

                if (Mist.graphsController.isOpen)
                    return;
                if (!Mist.monitored_machines)
                   return;

                var datasources = [];
                var loadMetric = Mist.metricsController.getMetric('load.shortterm');
                Mist.monitored_machines.forEach(function (machineTuple) {
                    var backend = Mist.backendsController.getBackend(machineTuple[0]);
                    if (!backend) return;
                    var machine = Mist.backendsController.getMachine(machineTuple[1], machineTuple[0]);
                    if (!machine) return;
                    Mist.datasourcesController.addDatasource({
                        machine: machine,
                        metric: loadMetric,
                        callback: function (success, datasource) {
                            datasources.push(datasource);
                        }
                    });
                });

                if (!datasources.length)
                    return;

                Mist.graphsController.open({
                    graphs: [Graph.create({
                        title: 'Load on all monitored machines',
                        datasources: datasources,
                    })],
                    config: {
                        canModify: false,
                        canMinimize: false,
                        showGraphLegend: true,
                        historyWidgetPosition: 'bottom',
                    }
                });
            },


            //
            // Proxy actions for graph list control view
            //


            backClicked: function () {
                Mist.graphsController.history.goBack();
            },


            forwardClicked: function () {
                Mist.graphsController.history.goForward();
            },


            resetClicked: function () {
                Mist.graphsController.stream.start();
            },


            pauseClicked: function () {
                Mist.graphsController.stream.stop();
            },


            timeWindowChanged: function () {
                var newTimeWindow = $('#time-window-control select').val();
                Mist.graphsController.resolution.change(newTimeWindow);
            },


            //
            //
            //  Observers
            //
            //


            checkedMonitoringObserver: function () {
                Ember.run.later(this, function () {
                    if (Mist.backendsController.checkedMonitoring)
                        this.showGraphs();
                }, 500); // to make sure datasources exist
            }.observes('Mist.backendsController.checkedMonitoring')
        });
    }
);
