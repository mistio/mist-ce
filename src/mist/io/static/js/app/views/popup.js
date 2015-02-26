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
                this.set('popupId', this.getWidgetID());
            },


            //
            //
            //  Methods
            //
            //


            open: function (position) {
                if (position)
                    $(this.popupId).popup('option', 'positionTo', position);
                $(this.popupId).popup('open');
            },


            close: function () {
                $(this.popupId).popup('close');
            }
        });
    }
);
