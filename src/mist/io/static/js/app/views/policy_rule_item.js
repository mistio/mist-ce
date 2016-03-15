define('app/views/policy_rule_item', ['ember'],
    //
    //  Policy Item Component
    //
    //  @returns Class
    //
    function() {

        'use strict';

        return App.PolicyRuleItemComponent = Ember.Component.extend({

            //
            //  Properties
            //

            layoutName: 'policy_rule_item',
            tagName: 'tr',
            classNames: ['rule-item'],
            rule: null,
            team: null,
            index: null,

            //
            // Computed Properties
            //

            orderIndex: Ember.computed('index', function() {
                return this.get('index') + 1 + '.';
            }),

            isLast: Ember.computed('rule', 'team.policy.rules.[]', function() {
                var rules = this.get('team.policy.rules'),
                len = rules.length;
                return rules.indexOf(this.get('rule')) == len - 1;
            }),

            isFirst: Ember.computed('rule', 'team.policy.rules.[]', function() {
                var rules = this.get('team.policy.rules');
                return rules.indexOf(this.get('rule')) === 0;
            }),

            //
            // Initialization
            //

            load: function() {
                Ember.run.scheduleOnce('afterRender', this, function() {
                    $('body').enhanceWithin();
                });
            }.on('didInsertElement'),

            //
            // Actions
            //

            actions: {
                openRuleOperatorPopup: function() {
                    Mist.policyRuleEditController.open(this.get('rule'), this.get('team'), 'operator', null, this.elementId);
                },

                openRuleActionPopup: function() {
                    Mist.policyRuleEditController.open(this.get('rule'), this.get('team'), 'action', null, this.elementId);
                },

                openRuleResourcePopup: function() {
                    Mist.policyRuleEditController.open(this.get('rule'), this.get('team'), 'resource', null, this.elementId);
                },

                moveUpRule: function() {
                    Mist.teamsController.moveUpRule(this.get('rule'), this.get('team'));
                },

                moveDownRule: function() {
                    Mist.teamsController.moveDownRule(this.get('rule'), this.get('team'));
                },

                deleteRule: function() {
                    Mist.teamsController.deleteRule({
                        team: this.get('team'),
                        rule: this.get('rule')
                    });
                }
            }
        });
    }
)
