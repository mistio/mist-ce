define('app/views/backend_button', ['app/views/templated'],
    //
    //  Backend Button View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return App.BackendButtonView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            backend: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.renderBackends();
            }.on('didInsertElement'),


            unload: function () {
                this.renderBackends();
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            renderBackends: function () {
                Ember.run.next(function () {
                    if ($('#backend-buttons').controlgroup)
                        $('#backend-buttons').controlgroup('refresh');
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                buttonClicked: function () {
                    $('#backend-edit').popup('option',
                        'positionTo', '#' + this.elementId);
                    Mist.backendEditController.open(this.backend);
                }
            }

        });
    }
);
