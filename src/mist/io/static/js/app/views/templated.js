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
            //
            //  Initialization
            //
            //


            init: function () {

                this._super();
                //var templateName = this.__proto__._debugContainerKey.split(':')[1].toUnderscore();
                //warn(templateName);
                //this.set('templateName', this.templateForName(this.getName()));
            },

            didInsertElement: function () {
                this._super();
                $('body').enhanceWithin();
                Ember.run.next(function(){
                    $("[data-role='collapsible']").collapsible({
                        collapse: function( event ) {
                            $(this).children().next().slideUp(250);
                            var overlay = $(this).attr('id') ? $('#' + $(this).attr('id')+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('in').addClass('ui-screen-hidden');
                                //$('body').css('overflow', 'auto');
                            }
                            warn('collapse', overlay);
                        },
                        expand: function( event, ui ) {
                            var overlay = $(this).attr('id') ? $('#' + $(this).attr('id')+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('ui-screen-hidden').addClass('in');
                                //$('body').css('overflow', 'hidden');
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
