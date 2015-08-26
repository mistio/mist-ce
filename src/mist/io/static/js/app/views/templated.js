define('app/views/templated', ['ember'],
    //
    //  Templated View
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.View.extend({

            //
            //  Initialization
            //

            init: function () {
                this._super();
                var that = this;
                Ember.run.next(function(){
                    $("[data-role='collapsible']").collapsible({
                        collapse: function(event) {
                            $(this).children().next().slideUp(250);
                            var overlay = $(this).attr('id') ? $('#' + $(this).attr('id')+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('in').addClass('ui-screen-hidden');
                                overlay.height($())
                            }
                        },
                        expand: function(event, ui) {
                            var overlay = $(this).attr('id') ? $('#' + $(this).attr('id')+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('ui-screen-hidden').addClass('in');
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
