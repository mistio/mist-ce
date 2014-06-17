define('app/views/metric_add_custom', ['app/views/popup'],
    //
    //  Metric Add Custom View
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


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function () {
                    Mist.metricAddCustomController.close();
                },

                deployClicked: function () {
                    Mist.metricAddCustomController.add();
                },
            }
        });
    }
);
