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

            open: function (rule, team, property, callback, el) {
                this.clear();
                this.setProperties({
                    'rule': rule,
                    'team': team,
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
                    'team': null,
                    'property': null,
                    'callback': null
                });
            },

            edit: function (keyValuePairs) {
                Mist.teamsController.editRule({
                    team: this.team,
                    rule: this.rule,
                    properties: keyValuePairs
                });
                this.close();
            }
        });
    }
);
