define('app/views/monitoring', ['app/views/templated', 'app/models/graph'],
    /**
     *
     * Monitoring View
     *
     * @returns Class
     */
    function(TemplatedView, Graph) {

        return TemplatedView.extend({

            graphs : [],
            viewRendered: false,

            /**
            *
            * Initialize monitoring view. Automatically called by ember
            *
            */
            init: function() {
                this._super();
                this.setUpGraphs();
            },

            /**
            *
            * Called by ember when view is rendered
            *
            */
            didInsertElement: function(){
                this._super();
                this.set('viewRendered',true);
            },

            /**
            *
            * Called by ember when view will be destroyed
            * Stops data request and re-initializes enable button
            *
            */
            willDestroyElement: function(){

                this._super();
                Mist.monitoringController.request.stop();
                Mist.monitoringController.graphs.disableAnimation();
                Mist.monitoringController.reset();

                // Re-Initialize Enable Button Of Jquery Mobile
                Em.run.next(function() {
                    $('.monitoring-button').button();
                });
            },

            /**
            *
            * If monitoring is enabled Re-draws jqm components,
            * creates graph instances, initializes controller and
            * setups resize event
            *
            */
            setUpGraphs: function() {

                var machine = this.get('controller').get('model');

                // Check if disable button pressed
                // Then check if everything is ok to render the graphs
                if(machine.id != ' ' && this.viewRendered && !machine.hasMonitoring){

                    Mist.monitoringController.request.stop();
                }
                else if(this.viewRendered && machine.hasMonitoring && machine.id != ' '){

                    var self = this;
                    var controller = Mist.monitoringController;

                    var setup = function() {

                        // Check if jqm is initialized
                        if(!Mist.isJQMInitialized){

                            window.setTimeout(setup,1000);
                        }
                        else{

                            Ember.run.next(function() {

                                // Re-Initialize jquery components and hide buttons
                                self.redrawJQMComponents();
                                $('.graphBtn').hide(0);

                                controller.initialize({
                                    machineModel    : machine,      // Send Current Machine
                                    graphs          : self.graphs,  // Send Graphs Instances
                                });

                                // Set Up Resolution Change Event
                                $(window).resize(function(){

                                    var newWidth = $("#GraphsArea").width() -2;
                                    self.graphs.forEach(function (graph) {
                                        //graph.changeWidth(newWidth);
                                    });
                                })

                            });
                        }
                    }

                    setup();
                    Mist.rulesController.redrawRules();
                }
            }.observes('controller.model.hasMonitoring','viewRendered'),

            /**
            *
            * Re-draws JQM Components of monitoring
            *
            */
            redrawJQMComponents: function(){

                $('.monitoring-button').trigger('create');
                $('#add-rule-button').trigger('create');
                $('#monitoring-dialog').trigger('create');

                $('#graphBar').trigger('create');

                // History And Zoom Buttons
                $('.graphControls').trigger('create');

                // Disable History
                $('#graphsGoForward').addClass('ui-disabled');
                $('#graphsResetHistory').addClass('ui-disabled');
            }
        });
    }
);
