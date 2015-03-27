define('app/views/cloud_button', ['app/views/templated'],
    //
    //  Cloud Button View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return App.CloudButtonView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            cloud: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.renderClouds();
                this.stateObserver();
            }.on('didInsertElement'),


            unload: function () {
                this.renderClouds();
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            renderClouds: function () {
                Ember.run.next(function () {
                    if ($('#cloud-buttons').controlgroup)
                        $('#cloud-buttons').controlgroup('refresh');
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                buttonClicked: function () {
                    $('#cloud-edit').popup('option',
                        'positionTo', '#' + this.elementId);
                    Mist.cloudEditController.open(this.cloud);
                }
            },


            //
            //
            //  Observers
            //
            //


            stateObserver: function () {

                var btn = $('#' + this.elementId + ' a');
                btn.addClass('ui-btn-icon-left')
                    .removeClass('ui-icon-check')
                    .removeClass('ui-icon-offline')
                    .removeClass('ui-icon-waiting');

                if (this.cloud.state == 'online')
                    btn.addClass('ui-icon-check')
                else if (this.cloud.state == 'offline')
                    btn.addClass('ui-icon-offline')
                else if (this.cloud.state == 'waiting')
                    btn.addClass('ui-icon-waiting')
                        .removeClass('ui-btn-icon-left');

            }.observes('cloud.state')
        });
    }
);
