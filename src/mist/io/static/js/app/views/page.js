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
                $('.ui-page-active').parent().trigger('create');
            }
        });
    }
);
