define('app/views/graph_list', ['app/views/templated'],
    //
    //  Graph List View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return App.GraphListView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //

            templateName: "graph_list",
            actionProxy: null,


        });
    }
);
