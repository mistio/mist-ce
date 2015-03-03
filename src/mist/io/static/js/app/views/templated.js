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
                this.set('template', this.templateForName(this.getName()));
            }
        });
    }
);
