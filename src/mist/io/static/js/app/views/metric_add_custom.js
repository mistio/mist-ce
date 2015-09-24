define('app/views/metric_add_custom', ['app/views/popup'],
    //
    //  Metric Add Custom View
    //
    //  @returns Class
    //
    function (PopupComponent) {

        'use strict';

        return App.MetricAddCustomComponent = PopupComponent.extend({

            layoutName: 'metric_add_custom',
            controllerName: 'metricAddCustomController',
            popupId: '#metric-add-custom',
            
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
                Ember.run.next(this, function () {
                    $(this.popupId + ' .ember-checkbox')
                        .checkboxradio('refresh');
                    $('#custom-plugin-script').scrollTop();
                    $('#advanced-toggle').val(0);
                    $('#advanced-toggle').slider('refresh')
                        .trigger('change');
                });
            },


            updateDeployButton: function () {
                if (Mist.metricAddCustomController.addingMetric ||
                    !Mist.metricAddCustomController.formReady) {
                    $('#deploy').addClass('ui-state-disabled');
                } else {
                    $('#deploy').removeClass('ui-state-disabled');
                }
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
                    $('#custom-plugin-error').slideUp().text('');
                    $('#custom-plugin-script').removeClass('error');
                    Mist.metricAddCustomController.add();
                },

                advancedToggled: function () {
                    if ($('#advanced-toggle').val() == '1') {
                        $('#custom-plugin-advanced').slideDown();
                    } else {
                        $('#custom-plugin-advanced').slideUp();
                    }
                }
            },


            //
            //
            //  Observers
            //
            //


            updateDoneButtonObserver: function () {
                Ember.run.once(this, 'updateDeployButton');
            }.observes('Mist.metricAddCustomController.addingMetric',
                'Mist.metricAddCustomController.formReady')
        });
    }
);
