define('app/views/policy_operator_edit', ['app/views/controlled'],
    //
    //  Policy Operator Edit View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return App.PolicyOperatorEditComponent = ControlledComponent.extend({

            //
            //  Properties
            //

            layoutName: 'policy_operator_edit',
            controllerName: 'policyOperatorEditController',
            policy: null,
            operatorOptions: ['ALLOW', 'DENY'],

            //
            //  Methods
            //

            open: function (property, el) {
                this.set('policy', Mist.policyOperatorEditController.policy);

                // Get button on which to position the popup
                var button = '#' + el + ' .policy-operator-button.policy-' + property;

                // Reposition popup on the button
                $('#policy-operator')
                    .popup('option', 'positionTo', button);

                // Open the popup
                Ember.run.next(function () {
                   $('#policy-operator').popup('open');
                });
            },

            close: function (property) {
                $('#policy-operator').popup('close');
            },

            //
            //  Actions
            //

            actions: {
                operatorClicked: function (operator) {
                    console.log(operator);
                    Mist.policyOperatorEditController.edit({
                        operator: operator
                    });
                }
            }
        });
    }
);
