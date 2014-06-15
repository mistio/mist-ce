define('app/views/graph_button', ['app/views/templated'],
    //
    //  Graph Button View
    //
    //  @returns Class
    //
    function(TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graph: null,
            buttonId: null,
            tagName: 'span',


            //
            //
            //  Methods
            //
            //


            load: function () {

                this.set('buttonId', this.graph.id + '-btn');

                // Set button visibility
                Ember.run.next(this, function () {

                    var cookies = Mist.monitoringController.cookies;
                    if (cookies.collapsedGraphs.indexOf(this.graph.metrics[0].hashedId) > -1)
                        $('#' + this.buttonId).show();
                    else
                        $('#' + this.buttonId).hide();
                });
            }.on('didInsertElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                expandClicked: function () {
                    Mist.monitoringController.UI.expandPressed(this.graph.id);
                }
            }
        });
    }
);
