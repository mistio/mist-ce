define('app/views/graph_list_control', ['app/views/templated'],
    //
    //  Graph List Control View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return App.GraphListControlView = TemplatedView.extend({


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
                this._repositionWidget();
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


            _repositionWidget: function () {
                var parent = this.$();
                var prev = parent.prev();
                var next = parent.next();
                var position = Mist.graphsController.config.historyWidgetPosition;

                // Move to end
                parent.detach().appendTo('#' + position + '-history');
                prev.detach().appendTo('#' + position + '-history');
                next.detach().appendTo('#' + position + '-history');
            }
        });
    }
);
