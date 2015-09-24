define('app/views/metric_node', [],
    //
    //  Metric Node View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return App.MetricNodeComponent = Ember.Component.extend({

            layoutName: 'metric_node',


            //
            //  Properties
            //

            node: null,
            metric: null,
            unfold: false,
            element: null,


            //
            //  Initialization
            //

            load: function () {
                this.set('element', $('#'+this.elementId));
                this.indentNode();

                if (this.node.isRootNode)
                    this.unfoldChildren();

                if (this.node.isEndNode)
                    this.set('metric',
                        Mist.metricAddController.getMetric(
                            this.node.target));
            }.on('didInsertElement'),


            //
            //  Methods
            //

            indentNode: function () {
                // Loop starts from 1 because 0 nested items
                // should not be indented
                for (var i = 1; i < this.node.nestIndex; i++)
                    $('<div class="margin"></div>').insertBefore(this.element);
            },

            foldChildren: function () {
                this.set('unfold', false);

                // Change icons
                var a = this.element.find('> a.parent-node').eq(0);
                a.removeClass('icon-up');
                a.addClass('icon-down');

                this.element.find('.nest').eq(0).slideUp();
            },

            foldSiblings: function () {
                var siblings = this.element.siblings().filter('.ember-view');
                var that = this;
                siblings.toArray().forEach(function (sibling) {
                    that._viewRegistry[sibling.id].foldChildren();
                });
            },

            preCenterNode: function () {
                this.set('prevOffsetTop', this.element.offset().top);
                this.set('prevWinScrollTop', $(window).scrollTop());
            },

            centerNode: function () {
                if (!this.element) return;
                var afterOffsetTop = this.element.offset().top;
                var afterWinScrollTop = $(window).scrollTop();

                var prevTop = this.prevOffsetTop - this.prevWinScrollTop;
                var afterTop = afterOffsetTop - afterWinScrollTop;
                if (afterOffsetTop < afterWinScrollTop) {
                    var scrollTo = prevTop - afterTop;
                    Mist.smoothScroll($(window).scrollTop() - scrollTo);
                }
            },

            unfoldChildren: function () {
                this.preCenterNode();
                this.set('unfold', true);

                // Change icons
                var a = this.element.find('> a.parent-node').eq(0);
                a.removeClass('icon-down');
                a.addClass('icon-up');

                this.foldSiblings();
                var that = this;
                Ember.run.next(function () {
                    if (that.element)
                        that.element.find('.nest').eq(0).slideDown(400, function () {
                            that.centerNode();
                        });
                });
            },


            //
            //  Actions
            //

            actions: {
                toggleUnfold: function () {
                    if (this.unfold)
                        this.foldChildren();
                    else
                        this.unfoldChildren();
                },

                selectMetric: function () {
                    var that = this;
                    Mist.metricAddController.set('newMetric', this.metric);
                    Mist.metricAddController.add();
                },
            }
        });
    }
);
