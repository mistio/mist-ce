define('app/views/cloud_button', [],
    //
    //  Cloud Button View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.CloudButtonComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'cloud_button',
            cloud: null,


            //
            //  Initialization
            //

            load: function () {
                this.renderClouds();
            }.on('didInsertElement'),

            unload: function () {
                this.renderClouds();
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            renderClouds: function () {
                Ember.run.next(function () {
                    if ($('#cloud-buttons').controlgroup)
                        $('#cloud-buttons').controlgroup('refresh');
                });
            },


            //
            //  Actions
            //

            actions: {
                buttonClicked: function () {
                    Mist.cloudEditController.open(this.cloud, '#' + this.elementId);
                }
            }
        });
    }
);
