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
                if (!this.get('controllerName')){
                    this.set('controllerName', this.getControllerName());
                    warn('setting controller name to ', this.getControllerName());
                } else
                    warn(this.get('controllerName'));

            },


            didInsertElement: function () {
                this._super();
                var controller = Mist.get(this.controllerName);
                if (!controller)
                    warn('cannot find ', this.controllerName);
                if (controller) {
                    warn('setting controller view', this.controllerName);
                    controller.set('view', this);
                }

            },


            willDestroyElement: function () {
                this._super();
                var controller = Mist.get(this.controllerName);
                if (controller)
                    controller.set('view', null);
            }
        });
    }
);
