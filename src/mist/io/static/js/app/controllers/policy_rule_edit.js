define('app/controllers/policy_rule_edit', ['ember'],
    //
    //  Policy Rule Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            rule: null,
            team: null,
            property: null,
            callback: null,


            //
            //  Methods
            //

            open: function (rule, property, callback, el) {
                console.log(rule, property, callback, el);
                this.clear();
                this.setProperties({
                    'rule': rule,
                    'property': property,
                    'callback': callback
                });
                this.view.open(property, el);
            },

            close: function () {
                this.view.close(this.property);
                this.clear();
            },

            clear: function () {
                this.setProperties({
                    'rule': null,
                    'property': null,
                    'callback': null
                });
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
