define('app/views/graph_button', ['app/views/templated'],
    //
    //  Graph Button View
    //
    //  @returns Class
    //
    function(TemplatedView) {

        'use strict';

        return App.GraphButtonView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            graph: null,
            buttonId: null,
            tagName: 'span',
            actionProxy: null,

            //
            //
            //  Methods
            //
            //


            load: function () {
                this.set('buttonId', this.graph.id + '-btn');
            }.on('didInsertElement'),


            //
            //
            //  Observers
            //
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
