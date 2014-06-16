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


            open: function () {
                this._super();
                Ember.run.later(this, function () {
                    $(this.popupId).popup('reposition', {
                        positionTo: '#add-metric-btn'
                    });
                }, 200);
            },


            clear: function () {
            },


            actions: {

                customClicked: function () {
                    this.close();
                    Ember.run.later(this, function () {
                        $('#metric-custom').popup('open');
                    }, 400);
                },

                backClicked: function () {
                    $('#metric-custom').popup('close');
                    Ember.run.later(this, function () {
                        this.open();
                    }, 400);
                },

                deployClicked: function () {
                    Mist.metricAddController.deploy();
                },
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
