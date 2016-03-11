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
                    Mist.policyRuleEditController.open(this.get('rule'), 'operator', null, this.elementId);
                },

                openRuleActionPopup: function() {
                    Mist.policyRuleEditController.open(this.get('rule'), 'action', null, this.elementId);
                },

                openRuleResourcePopup: function() {
                    Mist.policyRuleEditController.open(this.get('rule'), 'resource', null, this.elementId);
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
