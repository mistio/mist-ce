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
            //  Properties
            //
            //


            actionProxy: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                Ember.run.next(this, function () {
                    // Make sure element is rendered
                    this.$().trigger('create');
                });
            }.on('didInsertElement'),


            //
            //
            //  Pseudo-Private Methods
            //
            //
        });
    }
);
