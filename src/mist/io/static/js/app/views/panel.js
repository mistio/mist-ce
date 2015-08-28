define('app/views/panel', ['app/views/controlled'],
    //
    //  Panel View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return ControlledComponent.extend({

            //
            //  Properties
            //

            panelId: null,


            //
            //  Initialization
            //

            init: function () {
                this._super();
            },


            //
            //  Methods
            //

            open: function () {
                this.animateToTop();
                $(this.panelId).panel('open');
                this.handlePanelWidth();
                this.handlePageHeight();
            },

            close: function () {
                $(this.panelId).panel('close');
            },

            animateToTop: function () {
                $('.ui-page-active').animate({
                    scrollTop: 0
                }, 'slow');
                $(this.panelId + ' .ui-panel-inner').animate({
                    scrollTop: 0
                }, 'slow');
            },

            handlePanelWidth: function () {
                $('.ui-panel-dismiss-position-right').css('right',
                    $('.ui-panel-position-right.ui-panel-open').width()
                );
            },

            handlePageHeight: function () {
                Ember.run.next(function () {
                    var panelHeight = $('.ui-panel-open').height(),
                        pageHeight = $('.ui-page-active').height();
                    if (panelHeight > pageHeight) {
                        $('.ui-page-active').height(panelHeight);
                    }
                });
            }
        });
    }
);
