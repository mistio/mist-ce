define('app/controllers/policy_operator_edit', ['ember'],
    //
    //  Policy Operator Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            policy: null,
            team: null,
            property: null,
            callback: null,


            //
            //  Methods
            //

            open: function (policy, property, callback, el) {
                console.log(policy, property, callback, el);
                this.clear();
                this.setProperties({
                    'policy': policy,
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
                    'policy': null,
                    'property': null,
                    'callback': null
                });
            },

            edit: function (keyValuePairs) {
                Mist.policysController.editRule({
                    policy      : this.policy,
                    callback  : this.callback,
                    properties: keyValuePairs
                });
                this.close();
            }
        });
    }
);
