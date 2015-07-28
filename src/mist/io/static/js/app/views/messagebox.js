define('app/views/messagebox', ['app/views/templated'],
    //
    //  Message Box View
    //
    // @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return App.MessageBoxView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //

            templateName: 'messagebox',
            popup: '#message-box',


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('popup', $(this.popup));
                Mist.notificationController.messageBox.set('view', this);
            }.on('didInsertElement'),


            unload: function () {
                Mist.notificationController.messageBox.set('view', null);
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            open: function () {
                Ember.run.later(this, function () {
                    this.popup.popup('reposition', {positionTo: 'window'});
                    Ember.run.next(this, function () {
                        this.popup.popup('open');
                    });
                }, 400);
            },


            close: function () {
                this.popup.popup('close');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                okClicked: function() {
                    Mist.notificationController.messageBox.close();
                },
            }
        });
    }
);
