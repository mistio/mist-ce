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
                    Mist.graphsController.history.goBack();
                },


                forwardClicked: function () {
                    Mist.graphsController.history.goForward();
                },


                resetClicked: function () {
                    Mist.graphsController.stream.start();
                },


                pauseClicked: function () {
                    Mist.graphsController.stream.stop();
                },


                timeWindowChanged: function () {
                    var newTimeWindow = $('#time-window-control select').val();
                    Mist.graphsController.resolution.change(newTimeWindow);
                }
            }
        });
    }
);
