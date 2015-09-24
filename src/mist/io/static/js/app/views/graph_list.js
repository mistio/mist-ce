define('app/views/graph_list', [],
    //
    //  Graph List Component
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.GraphListComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: "graph_list",
            actionProxy: null
        });
    }
);
