define('app/controllers/rule_edit', ['ember'],
    //
    //  Rule Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            rule: null,
            callback: null,


            //
            //
            //  Methods
            //
            //


            open: function (rule, option, callback) {
                this.clear();
                this.set('rule', rule)
                    .set('callback', callback);
                this.view.open(option);
            },


            clear: function () {
                this.set('rule', null)
                    .set('callback', null);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            //
            //
            //  Observers
            //
            //

        });
    }
);
