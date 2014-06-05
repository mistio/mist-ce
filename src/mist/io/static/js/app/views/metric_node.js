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
            //  Methods
            //
            //

            load: function () {
                try{
                    var nestIndex = this.node.nestIndex;
                    var element = $('#'+this.elementId);
                    for (var i = 0; i < nestIndex; i++) {
                        $('<div class="margin"></div>').insertBefore(element);
                    }
                } catch(e) {

                }
                //$('#'+this.elementId).parent().trigger('create');
            }.on('didInsertElement'),


            actions: {

                toggleUnfold: function () {
                    this.set('unfold', !this.unfold);
                    Ember.run.next(function () {
                        $('#metric-add').popup('reposition',
                            {positionTo: '#add-metric-btn'});
                    });
                },
            }
        });
    }
);
