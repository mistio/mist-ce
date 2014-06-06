define('app/views/metric_node', ['app/views/templated'],
    //
    //  Metric Node View
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


            node: null,
            unfold: false,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.indentNode();
                this.set('unfold',this.node.isRootNode );
            }.on('didInsertElement'),


            //
            //
            //  Methods
            //
            //


            indentNode: function () {
                var element = $('#'+this.elementId);
                for (var i = 1; i < this.node.nestIndex; i++)
                    $('<div class="margin"></div>').insertBefore(element);
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                toggleUnfold: function () {
                    this.set('unfold', !this.unfold);
                    Ember.run.next(this, function () {

                        // Reposition popup
                        $('#metric-add').popup('reposition',
                            {positionTo: '#add-metric-btn'});

                        // Change icons
                        var a = $('#'+this.elementId).find('a.parent-node').eq(0);
                        if (this.unfold) {
                            a.removeClass('ui-icon-carat-d');
                            a.addClass('ui-icon-carat-u');
                        } else {
                            a.removeClass('ui-icon-carat-u');
                            a.addClass('ui-icon-carat-d');
                        }
                    });
                },


                selectMetric: function () {

                },
            }
        });
    }
);
