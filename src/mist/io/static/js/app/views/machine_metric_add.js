define('app/views/machine_metric_add', ['app/views/popup', 'ember'],
    //
    //  Machine Metric Add View
    //
    //  @returns Class
    //
    function (PopupView) {

        'use strict';

        return PopupView.extend({


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function () {
                    Mist.machineMetricAddController.close();
                },

                addClicked: function () {
                    Mist.machineMetricAddController.add();
                }
            }

        });
    }
);
