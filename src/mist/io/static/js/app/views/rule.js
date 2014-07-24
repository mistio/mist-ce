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
            newRuleValue: null,
            isUpdatingValue: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this.set('newRuleValue', this.rule.value);
                Ember.run.next(this, function () {
                    $('#'+this.elementId).trigger('create');
                })
            }.on('didInsertElement'),


            //
            //
            // Methods
            //
            //


            valueChange: function () {

                // Prevent multiple requests
                if (this.isUpdatingValue)
                    return;

                this.set('isUpdatingValue', true);
                Ember.run.later(this, function () {
                    this.set('isUpdatingValue', false);
                    var that = this;
                    Mist.rulesController.updateRule(
                        this.rule.id, null, null, this.newRuleValue, null, null,
                        function (success) {
                            if (!success)
                                that.set('newRuleValue', that.rule.value);
                        });
                }, 500);
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


                deleteRuleClicked: function () {
                    Mist.rulesController.deleteRule(this.rule);
                },


                openAdvancedCondition: function () {

                    var that = this;
                    $('#' + that.elementId + ' .rule-more').fadeOut(200, function () {
                        $('#' + that.elementId + ' .advanced-condition').fadeIn();
                    });
                }
            },


            //
            //
            //  Observers
            //
            //


            newRuleValueObserver: function () {
                Ember.run.once(this, 'valueChange');
            }.observes('newRuleValue'),
        });
    }
);
