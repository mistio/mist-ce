define('app/views/graph_history', ['app/views/templated'],
    //
    //  Graph History View
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

            }
        });
    }
);
