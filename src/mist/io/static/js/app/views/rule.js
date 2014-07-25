define('app/views/rule', ['app/views/templated', 'ember'],
    //
    //  Rule View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict'

        return TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            rule: null,
            isUpdating: null,
            newRuleValue: null,
            newRuleTimeWindow: null,
            newRuleTimeWindowInMinutes: null,


            //
            //
            //  Computed Properties
            //
            //


            aggregateIsAny: function () {
                return this.rule.aggregate.value == 'any';
            }.property('rule', 'rule.aggregate'),


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('newRuleValue', this.rule.value);
                this.set('newRuleTimeWindowInMinutes',  1 + this.rule.timeWindow / 60);
                Ember.run.next(this, function () {
                    $('#'+this.elementId).trigger('create');
                })
            }.on('didInsertElement'),


            //
            //
            // Methods
            //
            //


            update: function () {

                // Prevent multiple requests
                if (this.isUpdating)
                    return;

                this.set('isUpdating', true);
                Ember.run.later(this, function () {
                    this.set('isUpdating', false);
                    var that = this;
                    Mist.rulesController.updateRule(
                        this.rule.id, null, null, this.newRuleValue, null, null,
                        function (success) {
                            if (!success) {
                                that.set('newRuleValue', that.rule.value);
                                that.set('newRuleTimeWindowInMinutes', 1 + that.rule.timeWindow / 60);
                            }
                        }, null, this.newRuleTimeWindow);
                }, 500);
            },


            convertTimeWindow: function () {
                this.set('newRuleTimeWindow', (this.newRuleTimeWindowInMinutes - 1) * 60);
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                openMetricPopup: function () {
                    Mist.ruleEditController.open(this.rule, 'metric');
                },


                openOperatorPopup: function () {
                    Mist.ruleEditController.open(this.rule, 'operator');
                },


                openActionPopup: function () {
                    Mist.ruleEditController.open(this.rule, 'action');
                },


                openAggregatePopup: function () {
                    Mist.ruleEditController.open(this.rule, 'aggregate');
                },


                deleteRuleClicked: function () {
                    Mist.rulesController.deleteRule(this.rule);
                },


                openAdvancedCondition: function () {
                    var that = this;
                    $('#' + that.elementId + ' .rule-more').fadeOut(200, function () {
                        $('#' + that.elementId + ' .advanced-condition').fadeIn();
                    });
                },
            },


            //
            //
            //  Observers
            //
            //


            textValuesObserver: function () {
                Ember.run.once(this, 'update');
            }.observes('newRuleValue', 'newRuleTimeWindow'),


            timeWindowInMinutesObserver: function () {
                Ember.run.once(this, 'convertTimeWindow');
            }.observes('newRuleTimeWindowInMinutes'),
        });
    }
);
