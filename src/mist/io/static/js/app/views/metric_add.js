define('app/views/metric_add', ['app/views/popup'],
    //
    //  Metric Add View
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
                //$('#metric-add-metric').collapsible('option', 'collapsedIcon', 'arrow-d')
                //             .collapsible('collapse');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function () {
                    Mist.metricAddController.close();
                },


                addClicked: function () {
                    Mist.metricAddController.add();
                },


                selectMetric: function (metric) {
                    Mist.metricAddController.set('newMetric', {
                        name: metric.name,
                        newName: metric.name,
                        target: metric.target
                    });
                    $('#metric-add-metric').collapsible('option', 'collapsedIcon', 'check')
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
                    $('#metric-add-metric .ui-listview').listview('refresh');
                });
            }.observes('Mist.metricAddController.metrics'),


            formReadyObserver: function () {
                if (Mist.metricAddController.formReady ) {
                    $('#metric-add-ok').removeClass('ui-state-disabled');
                } else {
                    $('#metric-add-ok').addClass('ui-state-disabled');
                }
            }.observes('Mist.metricAddController.formReady')
        });
    }
);
