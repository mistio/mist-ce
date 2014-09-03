define('app/views/machine_monitoring', ['app/views/templated'],
    //
    //  Machine Monitoring View
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
                this.set('machine', this.get('controller').get('model'));
            }.on('didInsertElement'),


            //
            //
            //  Actions
            //
            //


            actions: {

                addMetricClicked: function () {
                    Mist.metricAddController.open(this.machine);
                }
            },
        });
    }
);
