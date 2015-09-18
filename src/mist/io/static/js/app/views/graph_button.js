define('app/views/graph_button', [],
    //
    //  Graph Button View
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return App.GraphButtonComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'graph_button',
            graph: null,
            buttonId: null,
            tagName: 'span',
            actionProxy: null,


            //
            //  Methods
            //

            load: function () {
                Ember.run.next(this, function(){
                    this.set('buttonId', this.graph.id + '-btn');
                });
            }.on('didInsertElement'),


            //
            //  Observers
            //

            isHiddenObserver: function () {
                if (this.graph.view.isHidden)
                    $('#' + this.buttonId).show(400);
                else
                    $('#' + this.buttonId).hide(400);
            }.observes('graph.view.isHidden')
        });
    }
);
