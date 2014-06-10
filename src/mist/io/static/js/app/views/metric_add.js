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
            }.observes('Mist.metricAddController.metrics')
        });
    }
);
