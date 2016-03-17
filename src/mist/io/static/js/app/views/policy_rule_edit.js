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
                    actions: ['All', 'Create', 'Read', 'Edit', 'EditTags', 'EditRules', 'EditGraphs', 'EditCustomMetrics', 'Start', 'Stop', 'Reboot', 'Destroy', 'RunScript', 'OpenShell', 'AssociateKey', 'DisassociateKey']
                }, {
                    type: 'Script',
                    actions: ['All', 'Add', 'Read', 'Edit', 'Run', 'Remove']
                }, {
                    type: 'Key',
                    actions: ['All', 'Add', 'Read', 'ReadPrivate', 'Remove', 'Edit']
                }, {
                    type: 'All',
                    actions: ['All', 'None']
                }
            ],
            resourceIdentificationOptions: ['id', 'tags'],
            resourceActionsOptions: Ember.computed('rule.rtype', 'resourceTypesOptions', function() {
                var options = this.get('resourceTypesOptions').filter(function(resource) {
                    return resource.type == this.get('rule.rtype');
                }, this);
                console.log(this.get('rule.rtype'), options);
                return options.length == 0 ? [] : options[0].actions;
            }),

            //
            //  Methods
            //

            open: function (property, el) {
                this.set('rule', Mist.policyRuleEditController.rule);
                // Get button on which to position the popup
                var button = '#' + el + ' .policy-rule-button.policy-rule-' + property;

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
                    Mist.policyRuleEditController.edit({
                        key: 'operator',
                        value: operator
                    });
                },

                actionClicked: function (action) {
                    Mist.policyRuleEditController.edit({
                        key: 'action',
                        value: action
                    });
                },

                resourceClicked: function (resource) {
                    Mist.policyRuleEditController.edit({
                        key: 'rtype',
                        value: resource
                    });
                },

                identificationClicked: function(identification) {
                    Mist.policyRuleEditController.edit({
                        key: 'identification',
                        value: identification
                    });
                }
            }
        });
    }
);
