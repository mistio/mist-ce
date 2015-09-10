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
            metrics: null,
            property: null,
            callback: null,


            //
            //
            //  Methods
            //
            //


            open: function (rule, property, callback) {
                this.clear();
                this.set('rule', rule)
                    .set('property', property)
                    .set('callback', callback);
                this.view.open(property);
            },


            close: function () {
                this.view.close(this.property);
                this.clear();
            },


            clear: function () {
                this.set('rule', null)
                    .set('property', null)
                    .set('callback', null);
            },


            edit: function (keyValuePairs) {
                Mist.rulesController.editRule({
                    rule      : this.rule,
                    callback  : this.callback,
                    properties: keyValuePairs
                });
                this.close();
            }
        });
    }
);
