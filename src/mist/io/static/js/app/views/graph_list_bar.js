define('app/views/graph_list_bar', ['app/views/templated'],
    //
    //  Graph List Bar View
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


            machine: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                // This is a hack to get the machine model.
                // It's a hack because graphs are now generic
                // and are not supposed to present data for
                // a single machine, or even be ONLY in single
                // machine view.

                this.set('machine',
                    this.get('parentView').get('parentView').get('machine'));
            }.on('didInsertElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                addGraphClicked: function () {
                    Mist.metricAddController.open(this.machine);
                }
            }
        });
    }
);
