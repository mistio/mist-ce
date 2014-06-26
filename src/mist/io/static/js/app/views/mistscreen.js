define('app/views/mistscreen', ['app/views/templated', 'ember'],
    //
    //  Page View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return TemplatedView.extend({


            //
            //
            //  Initialization
            //
            //


            didInsertElement: function () {
                this._super();
                $('.ui-page-active').parent().trigger('create');
            }
        });
    }
);
