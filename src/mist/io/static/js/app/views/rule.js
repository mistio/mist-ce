define('app/views/rule', ['app/views/templated', 'ember'],
    //
    //  Rule View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict'

        return App.RuleView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //


            isUpdating: null,
            newRuleValue: null,
            newRuleTimeWindow: null,


            //
            //
            //  Computed Properties
            //
            //


            rule: function () {
                return this.get('model');
            }.property('controller.model'),

            aggregateIsAny: function () {
                if (this.get('rule').aggregate) {
                    var isAny = this.get('rule').aggregate.value == 'any';
                    // Bad, but whatever for now...
                    if (!isAny)
                        Ember.run.next(this, function () {
                            $('#' + this.get('rule').id + ' .rule-time-window')
                                .parent().trigger('create');
                        });
                    return isAny;
                }
            }.property('rule', 'rule.aggregate'),


            //
            //
            //  Initialization
            //
            //


            load: function () {
                Ember.run.next(this, function () {
                    this.showAdvancedCondition();
                    this.updateTextValues();
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

                // Check if values actually changed
                if (this.get('rule').value == this.newRuleValue &&
                    1 + this.get('rule').timeWindow / 60 == this.newRuleTimeWindow)
                    return;

                this.set('isUpdating', true);
                Ember.run.later(this, function () {
                    this.set('isUpdating', false);
                    var that = this;
                    Mist.rulesController.editRule({
                        rule: this.get('rule'),
                        properties: {
                            value: this.newRuleValue,
                            reminder_offset: (this.newRuleTimeWindow - 1) * 60
                        },
                        callback: function (success) {
                            if (!success)
                                that.updateTextValues();
                        }
                    });
                }, 500);
            },


            updateTextValues: function () {
                this.setProperties({
                   newRuleTimeWindow: 1 + this.get('rule').timeWindow / 60,
                   newRuleValue: this.get('rule').value
                });
            },


            showAdvancedCondition: function (userClicked) {

                var el = '#' + this.elementId;

                // If user clicked the button to show the advanced condition,
                // use fade in and fade out for a smooth transition
                if (userClicked) {
                    $(el + ' .rule-more').fadeOut(200, function () {
                        $(el + ' .advanced-condition').fadeIn();
                    });
                    return;
                }

                // Show advanced condition if rule does not have the default values
                // Defaults:
                // "aggregate": "all"
                // "timeWindow": "0"

                if (!this.get('rule.aggregate'))
                    return;

                var isDefault = this.get('rule').aggregate.value == 'all' &&
                                this.get('rule').timeWindow == 0;

                if (!isDefault) {
                    $(el + ' .rule-more').hide(0);
                    $(el + ' .advanced-condition').show(0);
                }
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                openMetricPopup: function () {
                    Mist.ruleEditController.open(this.get('rule'), 'metric');
                },


                openOperatorPopup: function () {
                    Mist.ruleEditController.open(this.get('rule'), 'operator');
                },


                openActionPopup: function () {
                    Mist.ruleEditController.open(this.get('rule'), 'action');
                },


                openAggregatePopup: function () {
                    Mist.ruleEditController.open(this.get('rule'), 'aggregate');
                },


                deleteRuleClicked: function () {
                    Mist.rulesController.deleteRule(this.get('rule'));
                },


                openAdvancedCondition: function () {
                    this.showAdvancedCondition(true);
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


            timeWindowObserver: function () {
                Ember.run.once(this, 'updateTextValues');
            }.observes('rule', 'rule.timeWindow'),
        });
    }
);
