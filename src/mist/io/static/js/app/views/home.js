define('app/views/home', ['app/views/mistscreen', 'app/models/graph'],
    //
    //  Home View
    //
    //  @returns Class
    //
    function (PageView, Graph) {

        'use strict';

        return App.HomeView = PageView.extend({


            hasIncidents: function () {
                if (Mist.openIncidents)
                    return !!Mist.openIncidents.length;
            }.property('Mist.openIncidents'),


            //
            //
            //  Initialization
            //
            //


            load: function () {
                Ember.run.next(this, function () {
                    this.checkedMonitoringObserver();
                });
                Mist.cloudsController.on('onMachineListChange', this,
                    'checkedMonitoringObserver');
            }.on('didInsertElement'),


            unload: function () {
                Mist.graphsController.close();
                Mist.cloudsController.off('onMachineListChange', this,
                    'checkedMonitoringObserver');
            }.on('willDestroyElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                addCloud: function () {
                    Mist.cloudAddController.open();
                },

                incidentClicked: function (incident) {
                    var machine = incident.get('machine');
                    if (!machine)
                        Mist.notificationController.timeNotify(
                            'Machine not found', 2000);
                    else
                        Mist.Router.router.transitionTo('machine',
                            incident.get('machine'));
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
                    var cloud = Mist.cloudsController.getCloud(machineTuple[0]);
                    if (!cloud) return;
                    var machine = Mist.cloudsController.getMachine(machineTuple[1], machineTuple[0]);
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
            //
            //  Observers
            //
            //


            checkedMonitoringObserver: function () {
                Ember.run.later(this, function () {
                    if (Mist.cloudsController.checkedMonitoring)
                        this.showGraphs();
                }, 500); // to make sure datasources exist
            }.observes('Mist.cloudsController.checkedMonitoring')
        });
    }
);
