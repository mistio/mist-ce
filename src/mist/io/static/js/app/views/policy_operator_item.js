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
            // Computed Properties
            //

            operatorText: Ember.computed('team.policy.rules.[]', function() {
                return this.get('team') && this.get('team.policy.rules').length ? 'every other action ON any other resource' : 'every action ON any resource';
            }),

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
