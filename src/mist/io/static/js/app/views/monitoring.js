define('app/views/monitoring', ['app/views/templated', 'app/models/graph'],
    //
    //  Monitoring View
    //
    // @returns Class
    //
    function (TemplatedView, Graph) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graphs: [],


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.setUpGraphs();
            }.on('didInsertElement'),


            unload: function () {
                Mist.monitoringController.request.stop();
                Mist.monitoringController.graphs.disableAnimation();
                Mist.monitoringController.reset();
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            setUpGraphs: function () {

                var machine = this.get('controller').get('model');

                if (machine.id == ' ')
                    return;
                if (!machine.hasMonitoring) {
                    Mist.monitoringController.request.stop();
                    return;
                }

                var that = this;

                var setup = function () {

                    if (!Mist.isJQMInitialized) {
                        Ember.run.later(setup, 1000);
                        return;
                    }

                    Ember.run.next(function () {

                        Mist.monitoringController.initialize({
                            graphs: that.graphs,
                            machineModel: machine
                        });

                        // Set Up Resolution Change Event
                        $(window).resize(function () {

                            var newWidth = $('#GraphsArea').width() - 2;
                            that.graphs.forEach(function (graph) {
                                //graph.changeWidth(newWidth);
                            });
                        })
                    });
                }

                setup();
                Mist.rulesController.redrawRules();
            }.observes('controller.model.hasMonitoring')
        });
    }
);
