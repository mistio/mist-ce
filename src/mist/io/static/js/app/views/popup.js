define('app/views/popup', ['app/views/controlled', 'ember'],
    //
    //  Popup View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return ControlledComponent.extend({


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
                var popupId = this.popupId;
                Ember.run.next(function(){
                    $('body').enhanceWithin();
                    if (position)
                        $(popupId).popup('option', 'positionTo', position);
                    $(popupId).popup('open');

                });
            },


            close: function () {
                $(this.popupId).popup('close');
            }
        });
    }
);
