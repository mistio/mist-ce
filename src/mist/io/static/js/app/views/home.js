define('app/views/home', ['app/views/page', 'app/models/graph'],
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

                if (!Mist.monitored_machines)
                   return;

                var datasources = [];
                var loadMetric = Mist.metricsController.getMetric('load.shortterm');
                Mist.monitored_machines.forEach(function (machineTuple) {
                    var backend = Mist.backendsController.getBackend(machineTuple[0]);
                    if (!backend || !backend.get('enabled'))
                        return
                    var machine = Mist.backendsController.getMachine(machineTuple[1], machineTuple[0]);
                    if (!machine || machine.get('isWindows')) return;
                    Mist.datasourcesController.addDatasource({
                        machine: machine,
                        metric: loadMetric,
                        callback: function (success, datasource) {
                            datasources.push(datasource);
                        }
                    });
                });

                if (Mist.graphsController.isOpen) {
                    var listChanged = false;
                    var existingDatasources = Mist.graphsController.content[0].datasources;
                    datasources.some(function (datasource) {
                        var exists = existingDatasources.findBy('id', datasource.id);
                        if (!exists) {
                            listChanged = true;
                            return true;
                        }
                    });
                    if (existingDatasources.length != datasources.length)
                        listChanged = true;
                    if (!listChanged)
                        return;
                    Mist.graphsController.close();
                }

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
                    if (this.$() && Mist.backendsController.checkedMonitoring)
                        this.showGraphs();
                }, 500); // to make sure datasources exist
            }.observes('Mist.backendsController.checkedMonitoring')
        });
    }
);
