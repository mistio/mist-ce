define('app/views/popup', ['app/views/controlled', 'ember'],
    //
    //  Popup View
    //
    //  @returns Class
    //
    function (ControlledView) {

        'use strict';

        return ControlledView.extend({


            //
            //
            //  Properties
            //
            //


            popupId: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
            },


            //
            //
            //  Methods
            //
            //


            open: function (position) {
                warn('open popup view', this.popupId, position);
                var that = this;
                Ember.run.next(function(){
                    $(that.popupId).popup();
                    if (position)
                        $(that.popupId).popup('option', 'positionTo', position);
                    $(that.popupId).popup('open');
                    $('.ui-page-active').parent().trigger('create');
                });
            },


            close: function () {
                $(this.popupId).popup('close');
            }
        });
    }
);
