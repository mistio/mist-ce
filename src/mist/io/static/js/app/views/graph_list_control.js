define('app/views/graph_list_control', ['app/views/templated'],
    //
    //  Graph List Control View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.renderWidget();
            }.on('didInsertElement'),


            //
            //
            //  Methods
            //
            //


            renderWidget: function () {
                Ember.run.next(function () {
                    $('#time-window-control').trigger('create');
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                backClicked: function () {
                    Mist.graphsController.goBack();
                },


                forwardClicked: function () {
                    Mist.graphsController.goForward();
                },


                toggleStream: function () {
                    Mist.graphsController.toggleStreaming();
                },


                timeWindowChanged: function () {
                    info('yo');
                    var newTimeWindow = $('#time-window-control select').val();
                    Mist.graphsController.changeTimeWindow(newTimeWindow);
                }
            }
        });
    }
);
