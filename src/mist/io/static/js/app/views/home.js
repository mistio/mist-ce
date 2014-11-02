define('app/views/home', ['app/views/mistscreen', 'app/models/graph'],
    //
    //  Home View
    //
    //  @returns Class
    //
    function (MistScreen, Graph) {

        'use strict';

        return MistScreen.extend({


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.checkedMonitoringObserver();
            }.on('didInsertElement'),


            unload: function () {
                Mist.graphsController.close();
            }.on('willDestroyElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                addBackend: function () {
                    Mist.backendAddController.open();
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

                var machines = []
                Mist.backendsController.content.forEach(function (backend) {
                    backend.machines.content.forEach(function (machine) {
                        machines.push(machine);
                    });
                });

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

                if (!datasources.length) return;

                Mist.graphsController.open({
                    graphs: [Graph.create({
                        title: 'Load for all monitored servers',
                        datasources: datasources,
                    })],
                    config: {
                        canModify: false,
                        canMinimize: false,
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
                if (Mist.backendsController.checkedMonitoring)
                    this.showGraphs();
            }.observes('Mist.backendsController.checkedMonitoring')
        });
    }
);
