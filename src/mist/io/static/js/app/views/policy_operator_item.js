define('app/views/policy_operator_item', ['ember'],
    //
    //  Policy Operator Component
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return App.PolicyOperatorItemComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'policy_operator_item',
            tagName: 'tr',
            classNames: ['policy-operator'],
            policy: null,
            team: null,

            //
            // Actions
            //

            actions: {
                openPolicyOperatorPopup: function() {
                    Mist.policyOperatorEditController.open(this.get('policy'), this.get('team'), 'operator', null, this.elementId);
                }
            }
        });
    }
)
