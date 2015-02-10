define('app/controllers/script_add', ['ember'],
    //
    //  Script Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            open: function () {
                this.view.open();
            }

        });
    }
);
