define('app/views/backend_button', [],
    //
    //  Backend Button View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.BackendButtonComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'backend_button',
            backend: null,


            //
            //  Initialization
            //

            load: function () {
                this.renderBackends();
            }.on('didInsertElement'),

            unload: function () {
                this.renderBackends();
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            renderBackends: function () {
                Ember.run.next(function () {
                    if ($('#backend-buttons').controlgroup)
                        $('#backend-buttons').controlgroup('refresh');
                });
            },


            //
            //  Actions
            //

            actions: {
                buttonClicked: function () {
                    Mist.backendEditController.open(this.backend, '#' + this.elementId);
                }
            }
        });
    }
);
