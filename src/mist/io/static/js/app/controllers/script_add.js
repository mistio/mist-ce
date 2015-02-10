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
                url: '',
                type: {},
                entryPoint: '',
                text: ''
            }),

            open: function () {
                this.clear();
                this.view.selectType(this.get('newScript').get('type'));
                this.view.open();
            },

            close: function () {
                this.clear();
                this.view.close();
            },

            clear: function () {
                this.get('newScript').setProperties({
                    name: '',
                    url: '',
                    type: this.view.get('scriptTypes')[0],
                    entryPoint: '',
                    text: '',
                });
            },
        });
    }
);
