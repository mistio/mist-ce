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
            metric: null,
            unfold: false,
            element: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {

                this.set('element', $('#'+this.elementId));
                this.indentNode();

                if (this.node.isRootNode)
                    this.unfoldChildren();

                if (this.node.isEndNode)
                    this.set('metric',
                        Mist.metricsController.getMetricByTarget(
                            this.node.target));

            }.on('didInsertElement'),


            //
            //
            //  Methods
            //
            //


            indentNode: function () {
                // Loop starts from 1 because 0 nested items
                // should not be indented
                for (var i = 1; i < this.node.nestIndex; i++)
                    $('<div class="margin"></div>').insertBefore(this.element);
            },


            unfoldChildren: function () {

                this.foldSiblings();
                this.set('unfold', true);

                // Change icons
                var a = this.element.find('a.parent-node').eq(0);
                if (this.unfold) {
                    a.removeClass('ui-icon-carat-d');
                    a.addClass('ui-icon-carat-u');
                } else {
                    a.removeClass('ui-icon-carat-u');
                    a.addClass('ui-icon-carat-d');
                }

                // Show children
                this.element.find('.nest').eq(0).slideDown();
            },


            foldChildren: function () {
                this.set('unfold', false);
                $('#'+this.elementId).find('.nest').eq(0).slideUp();
            },


            foldSiblings: function () {
                //$('#'+this.elementId).find('.nest').eq(0).slideUp();
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                toggleUnfold: function () {
                    if (this.unfold)
                        this.foldChildren();
                    else
                        this.unfoldChildren();
                },


                selectMetric: function () {
                    alert(this.metric.name);
                },
            }
        });
    }
);
