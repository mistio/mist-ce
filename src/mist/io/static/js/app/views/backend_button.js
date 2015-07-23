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

            templateName: 'backend_button',
            backend: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.renderBackends();
                this.stateObserver();
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
                    Mist.backendEditController.open(this.backend, '#' + this.elementId);
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

                if (this.backend.state == 'online')
                    btn.addClass('ui-icon-check')
                else if (this.backend.state == 'offline')
                    btn.addClass('ui-icon-offline')
                else if (this.backend.state == 'waiting')
                    btn.addClass('ui-icon-waiting')
                        .removeClass('ui-btn-icon-left');

            }.observes('backend.state')
        });
    }
);
