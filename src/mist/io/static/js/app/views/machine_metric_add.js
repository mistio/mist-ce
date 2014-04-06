define('app/views/machine_metric_add', ['app/views/popup'],
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
            //  Methods
            //
            //


            clear: function () {
                $('#metric-add').collapsible('option', 'collapsedIcon', 'arrow-d')
                             .collapsible('collapse');
            },


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
                },


                selectMetric: function (metric) {
                    Mist.machineMetricAddController.set('newMetricTarget', metric);
                    $('#metric-add').collapsible('option', 'collapsedIcon', 'check')
                                                 .collapsible('collapse');
                }
            },


            //
            //
            //  Observers
            //
            //


            metricsObserver: function () {
                Ember.run.next(function () {
                    $('#metric-add .ui-listview').listview('refresh');
                });
            }.observes('Mist.machineMetricAddController.metrics'),


            formReadyObserver: function () {
                if (Mist.machineMetricAddController.formReady) {
                    $('#metric-add-ok').removeClass('ui-state-disabled');
                } else {
                    $('#metric-add-ok').addClass('ui-state-disabled');
                }
            }.observes('Mist.machineMetricAddController.formReady')
        });
    }
);
