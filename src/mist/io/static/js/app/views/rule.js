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
                    Mist.rulesController.deleteRule(this.rule.id);
                }
            }
        });
    }
);
