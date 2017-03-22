define('app/views/policy_rule_edit', ['app/views/controlled'],
    //
    //  Policy Rule Edit View
    //
    //  @returns Class
    //
    function(ControlledComponent) {

        'use strict';

        return App.PolicyRuleEditComponent = ControlledComponent.extend({

            //
            //  Properties
            //

            layoutName: 'policy_rule_edit',
            controllerName: 'policyRuleEditController',
            rule: null,
            operatorOptions: ['ALLOW', 'DENY'],
            resourceTypesOptions: [{
                type: 'cloud',
                actions: ['all', 'add', 'read', 'edit', 'remove', 'create_resources']
            }, {
                type: 'machine',
                actions: ['all', 'create', 'read', 'edit', 'edit_tags', 'edit_rules', 'edit_graphs', 'edit_custom_metrics', 'start', 'stop', 'reboot', 'destroy', 'run_script', 'open_shell', 'associate_key', 'disassociate_key']
            }, {
                type: 'script',
                actions: ['all', 'add', 'read', 'edit', 'run', 'remove']
            }, {
                type: 'key',
                actions: ['all', 'add', 'read', 'read_private', 'remove', 'edit']
            }, {
                type: 'all',
                actions: ['all', 'read', 'edit']
            }],
            resourceIdentificationOptions: ['...', 'where id', 'where tags'],
            resourceActionsOptions: Ember.computed('rule.rtype', 'resourceTypesOptions', function() {
                var options = this.get('resourceTypesOptions').filter(function(resource) {
                    return resource.type == this.get('rule.rtype');
                }, this);
                return options.length ? options.shift().actions : [];
            }),

            //
            //  Methods
            //

            open: function(property, el) {
                this.set('rule', Mist.policyRuleEditController.rule);
                // Get button on which to position the popup
                var button = '#' + el + ' .policy-rule-button.policy-rule-' + property;

                // Reposition popup on the button
                $('#policy-rule-' + property)
                    .popup('option', 'positionTo', button);

                // Open the popup
                Ember.run.next(function() {
                    $('#policy-rule-' + property).popup('open');
                });
            },

            close: function(property) {
                $('#policy-rule-' + property).popup('close');
            },

            //
            //  Actions
            //

            actions: {
                operatorClicked: function(operator) {
                    Mist.policyRuleEditController.edit({
                        key: 'operator',
                        value: operator
                    });
                },

                actionClicked: function(action) {
                    Mist.policyRuleEditController.edit({
                        key: 'action',
                        value: action
                    });
                },

                resourceClicked: function(resource) {
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
