define('app/views/policy_rule_edit', ['app/views/controlled'],
    //
    //  Policy Rule Edit View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return App.PolicyRuleEditComponent = ControlledComponent.extend({

            //
            //  Properties
            //

            layoutName: 'policy_rule_edit',
            controllerName: 'policyRuleEditController',
            rule: null,
            operatorOptions: ['ALLOW', 'DENY'],
            resourceTypesOptions: [
                {
                    type: 'Machine',
                    actions: ['Create', 'Read', 'Edit', 'EditTags', 'EditRules', 'EditGraphs', 'EditCustomMetrics', 'Start', 'Stop', 'Reboot', 'Destroy', 'RunScript', 'OpenShell', 'AssociateKey', 'DisassociateKey']
                }, {
                    type: 'Script',
                    actions: ['Add', 'Read', 'Edit', 'Run', 'Remove']
                }, {
                    type: 'Network',
                    actions: ['Create', 'Read', 'Edit', 'Remove', 'AllocateAddress']
                }, {
                    type: 'Key',
                    actions: ['Add', 'Read', 'ReadPrivate', 'Remove', 'Edit']
                }
            ],
            resourceActionsOptions: Ember.computed('rule.rtype', 'resourceTypesOptions', function() {
                var options = this.get('resourceTypesOptions').filter(function(resource) {
                    return resource.type.toLowerCase() == this.get('rule.rtype');
                }, this);
                return options.length == 0 ? [] : options[0].actions;
            }),

            //
            //  Methods
            //

            open: function (property, el) {
                this.set('rule', Mist.policyRuleEditController.rule);

                // Get button on which to position the popup
                var button = '#' + el + ' .policy-rule-button.policy-rule-' + property;
console.log(button);
                // Reposition popup on the button
                $('#policy-rule-' + property)
                    .popup('option', 'positionTo', button);

                // Open the popup
                Ember.run.next(function () {
                   $('#policy-rule-' + property).popup('open');
                });
            },

            close: function (property) {
                $('#policy-rule-' + property).popup('close');
            },

            //
            //  Actions
            //

            actions: {
                operatorClicked: function (operator) {
                    console.log(operator);
                    // Mist.policyRuleEditController.edit({
                    //     metric: metric
                    // });
                },

                actionClicked: function (action) {
                    console.log(action);
                    // Mist.policyRuleEditController.edit({
                    //     action: action
                    // });
                },

                resourceClicked: function (resource) {
                    console.log(resource);
                    // Mist.policyRuleEditController.edit({
                    //     resource: resource
                    // });
                }
            }
        });
    }
);
