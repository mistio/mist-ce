define('app/views/page', ['app/views/templated'],
    //
    //  Page View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return Ember.View.extend({


            //
            //
            //  Initialization
            //
            //


            didInsertElement: function () {
                this._super();
                $('body').trigger('create');
                Ember.run.next(function(){
                    $("[data-role='collapsible']").collapsible({
                        collapse: function( event ) {
                            $(this).children().next().slideUp(250);
                            var overlay=$('#' + $(this).attr('id')+'-overlay');
                            if (overlay) {
                                overlay.removeClass('in').addClass('ui-screen-hidden');
                                $('body').css('overflow', 'auto');
                            }
                        },
                        expand: function( event, ui ) {
                            var overlay=$(this).attr('id') ? $('#' + $(this).attr('id')+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('ui-screen-hidden').addClass('in');
                                $('body').css('overflow', 'hidden');
                            }
                            $(this).children().next().hide();
                            $(this).children().next().slideDown(250);
                        }
                    });
                });
            }
        });
    }
);
