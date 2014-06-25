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
            isUpdatingValue: null,


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

                valueChange: function () {

                    // Prevent multiple requests
                    if (this.isUpdatingValue)
                        return;

                    this.set('isUpdatingValue', true);
                    Ember.run.later(this, function () {
                        this.set('isUpdatingValue', false);

                        var value = $('#' + this.rule.id)
                            .find('.ui-slider input').val();

                        Mist.rulesController.updateRule(
                            this.rule.id, null, null, value);
                    }, 500);
                }
            }
        });
    }
);
