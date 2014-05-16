define('app/views/monitoring', ['app/views/templated', 'app/models/graph'],
    //
    //  Monitoring View
    //
    // @returns Class
    //
    function(TemplatedView, Graph) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graphs : [],


            //
            //
            //  Initialization
            //
            //


            load: function(){
                this.setUpGraphs();
            }.on('didInsertElement'),


            unload: function(){

                Mist.monitoringController.request.stop();
                Mist.monitoringController.graphs.disableAnimation();
                Mist.monitoringController.reset();

                // Re-Initialize Enable Button Of Jquery Mobile
                Em.run.next(function() {
                    $('.monitoring-button').button();
                });
            }.on('willDestroyElement'),



            //
            //
            //  Methods
            //
            //


            /**
            *
            * creates graph instances, initializes controller and
            * setups resize event
            *
            */
            setUpGraphs: function() {

                var machine = this.get('controller').get('model');

                // Check if disable button pressed
                // Then check if everything is ok to render the graphs
                if (machine.id != ' ' && !machine.hasMonitoring) {

                    Mist.monitoringController.request.stop();

                } else if (machine.hasMonitoring && machine.id != ' ') {

                    var that = this;
                    var controller = Mist.monitoringController;

                    var setup = function() {

                        if(!Mist.isJQMInitialized) {
                            Ember.run.later(setup, 1000);
                            return;
                        }

                        Ember.run.next(function() {

                            $('.graphBtn').hide(0);

                            controller.initialize({
                                graphs: that.graphs,
                                machineModel: machine,
                            });

                            // Set Up Resolution Change Event
                            $(window).resize(function(){

                                var newWidth = $('#GraphsArea').width() -2;
                                that.graphs.forEach(function (graph) {
                                    //graph.changeWidth(newWidth);
                                });
                            })

                        });
                    }

                    setup();
                    Mist.rulesController.redrawRules();
                }
            }.observes('controller.model.hasMonitoring'),
        });
    }
);
