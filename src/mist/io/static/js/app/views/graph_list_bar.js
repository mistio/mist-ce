define('app/views/graph_list_bar', [],
    //
    //  Graph List Bar View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.GraphListBarComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'graph_list_bar',
            machine: null,
            actionProxy: null,


            //
            //  Initialization
            //

            load: function () {
                // This is a hack to get the machine model.
                // It's a hack because graphs are now generic
                // and are not supposed to present data for
                // a single machine, or even be ONLY in single
                // machine view.

                try {
                    this.set('machine', this.actionProxy.get('machine'));
                } catch (e) {}
            }.on('didInsertElement')
        });
    }
);
