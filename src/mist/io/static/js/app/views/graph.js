define('app/views/graph', ['app/views/templated'],
    //
    // Graph View
    //
    // @returns Class
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


            //
            //
            //  Computed Properties
            //
            //


            graphId: function () {
                return 'graph-' + this.graph.id;
            }.property('graph'),


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.graph.appendGraph(this.graph.id, this.graph.metric, this.graph.width, this.graph.height);
            }.on('didInsertElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                collapseClicked: function () {
                    Mist.monitoringController.UI.collapsePressed(this.graph.id);
                }
            }
        });
    }
);
