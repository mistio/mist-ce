define('app/controllers/policy', ['ember'],
    //
    //  Policy Controller
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            operator: null,
            rule: null,
            team: null,
            callback: null,


            //
            //  Methods
            //

            editRule: function(args) {
                console.log(args);
                Mist.teamsController.editRule(args);
                // Mist.rulesController.editRule({
                //     rule      : this.rule,
                //     callback  : this.callback,
                //     properties: keyValuePairs
                // });
                // this.close();
            },

            editOperator: function(args) {
                console.log(args);
            }
        });
    }
);
