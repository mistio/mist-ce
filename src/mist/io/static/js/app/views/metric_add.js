define('app/views/metric_add', ['app/views/popup'],
    //
    //  Metric Add View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        return App.MetricAddComponent = PopupComponent.extend({

            layoutName: 'metric_add',
            controllerName: 'metricAddController',
            popupId: '#metric-add',

            //
            //  Methods
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
                Ember.run.later(function () {
                    Mist.notificationController.messageBox.open({
                        title: 'SSH key missing',
                        paragraphs: [
                            'Please add a key to your server ' +
                            'to deploy custom metrics.'
                        ],
                        callback: function () {
                            Ember.run.later(function () {
                                that.open();
                            }, 400);
                        }
                    });
                }, 400);
            },


            //
            //  Actions
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
