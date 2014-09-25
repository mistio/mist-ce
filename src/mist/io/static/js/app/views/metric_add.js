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


            addCustomMetric: function () {
                this.close();
                var that = this;
                Ember.run.later(function () {
                    Mist.metricAddCustomController.open(
                        Mist.metricAddController.machine,
                        function (success, metric) {
                            if (success)
                                Mist.metricAddController.close();
                            else
                                Ember.run.later(function () {
                                    that.open();
                                }, 400);
                        }
                    );
                }, 400);
            },


            showSSHError: function () {
                this.close();
                var that = this;
                Mist.notificationController.set('msgHeader', 'SSH key missing');
                Mist.notificationController.set('msgPart1', 'Please add a key to ' +
                    ' your server to deploy custom metrics.');
                Mist.notificationController.set('msgCallback', function () {
                    Ember.run.later(function () {
                        that.open();
                    }, 400);
                })
                Ember.run.later(function () {
                    Mist.notificationController.showMessagebox();
                }, 400);
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                customClicked: function () {
                    if (Mist.metricAddController.machine.probed)
                        this.addCustomMetric();
                    else
                        this.showSSHError();
                }
            }
        });
    }
);
