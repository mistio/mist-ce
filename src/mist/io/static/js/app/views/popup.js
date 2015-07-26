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
                $(this.popupId).popup();
                if (position)
                    $(this.popupId).popup('option', 'positionTo', position);
                $(this.popupId).popup('open');
                Ember.run.next(function(){
                    $('.ui-page-active').parent().trigger('create');
                });
            },


            close: function () {
                $(this.popupId).popup('close');
            }
        });
    }
);
