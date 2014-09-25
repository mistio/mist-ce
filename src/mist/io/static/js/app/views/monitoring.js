define('app/views/monitoring', ['app/views/templated'],
    //
    //  Monitoring View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graphs: [],
            machine: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('graphs', []);
                this.set('machine', this.get('controller').get('model'));
            }.on('didInsertElement'),


            unload: function () {
                Mist.monitoringController.request.stop();
                Mist.monitoringController.graphs.disableAnimation();
                Mist.monitoringController.reset();
                this.unhandleWindowResize();
                this.set('graphs', []);
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            renderControls: function () {
                Ember.run.next(function () {
                    $('.graphZoomer').trigger('create');
                });
            },


            setUpGraphs: function () {
                this.renderControls();
                this.handleWindowResize();
                Mist.monitoringController.initGraphs({
                    graphs: this.graphs,
                    machineModel: this.machine
                });
            },


            handleWindowResize: function () {
                var that = this;
                $(window).on('resize', function () {
                    var newWidth = $('#GraphsArea').width() - 2;
                    that.graphs.forEach(function (graph) {
                        if (graph.view)
                            graph.view.changeWidth(newWidth);
                    });
                });
            },


            unhandleWindowResize: function () {
                $(window).off('resize');
            },


            //
            //
            //  Observers
            //
            //


            actions: {

                addMetricClicked: function () {
                    Mist.metricAddController.open(this.machine);
                }
            },


            //
            //
            //  Observers
            //
            //


            hasMonitoringObserver: function () {
                if (this.machine.hasMonitoring)
                    this.setUpGraphs();
                else
                    Mist.monitoringController.request.stop();
            }.observes('machine.hasMonitoring'),


            beingDestroyedObserver: function () {
                Mist.monitoringController.disableUpdates(false);
            }.observes('beingDestroyed'),
        });
    }
);
