define('app/views/controlled', ['app/views/templated'],
    //
    //  Controlled View
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


            controllerName: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('controllerName', this.getControllerName());
            },


            didInsertElement: function () {
                this._super();
                Mist.get(this.controllerName).set('view', this);
            },


            willDestroyElement: function () {
                this._super();
                Mist.get(this.controllerName).set('view', null);
            }
        });
    }
);
