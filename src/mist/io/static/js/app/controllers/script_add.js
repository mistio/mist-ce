define('app/controllers/script_add', ['ember'],
    //
    //  Script Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            newScript: Ember.Object.create({
                name: '',
                url: ''
            }),

            open: function () {
                this.clear();
                this.view.open();
            },

            close: function () {
                this.clear();
                this.view.close();
            },

            clear: function () {
                this.get('newScript').setProperties({
                    name: '',
                    url: ''
                });
            },
        });
    }
);
