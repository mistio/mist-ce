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
                this.set('machine', this.get('controller').get('model'));
            }.on('didInsertElement'),


            unload: function () {
                Mist.monitoringController.request.stop();
                Mist.monitoringController.graphs.disableAnimation();
                Mist.monitoringController.reset();
                this.unhandleWindowResize();
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            setUpGraphs: function () {
                this.handleWindowResize();
                Mist.rulesController.redrawRules();
                Mist.monitoringController.initialize({
                    graphs: this.graphs,
                    machineModel: this.machine
                });
            },


            handleWindowResize: function () {
                var that = this;
                $(window).on('resize', function () {
                    var newWidth = $('#GraphsArea').width() - 2;
                    that.graphs.forEach(function (graph) {
                        graph.view.instance.changeWidth(newWidth);
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


            hasMonitoringObserver: function () {
                if (this.machine.hasMonitoring)
                    this.setUpGraphs();
                else
                    Mist.monitoringController.request.stop();
            }.observes('machine.hasMonitoring')
        });
    }
);
