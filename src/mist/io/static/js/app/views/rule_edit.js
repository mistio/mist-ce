define('app/views/rule_edit', ['app/views/controlled'],
    //
    //  Rule Edit View
    //
    //  @returns Class
    //
    function (ControlledView) {

        'use strict';

        return ControlledView.extend({


            //
            //
            //  Properties
            //
            //


            metrics: [],


            //
            //
            //  Methods
            //
            //


            open: function (option) {

                var button = '#' + Mist.ruleEditController.rule.id +
                    ' .rule-button.' + option;

                $('#rule-' + option)
                    .popup('option', 'positionTo', button)

                Ember.run.next(function () {
                   $('#rule-' + option).popup('open');
                });

                if (option == 'metric')
                    this.updateMetrics();

                if (option == 'command')
                    Mist.ruleEditController.set('command',
                        Mist.ruleEditController.rule.command);
            },


            updateMetrics: function () {
                this.set('metrics', this._parentView.metrics);
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                metricClicked: function (metric) {
                    $('#rule-metric').popup('close');
                    Mist.rulesController.updateRule(
                        Mist.ruleEditController.rule.id, metric.id);
                },


                operatorClicked: function (operator) {
                    $('#rule-operator').popup('close');
                    Mist.rulesController.updateRule(
                        Mist.ruleEditController.rule.id, null, operator);
                },


                actionClicked: function (action) {
                    $('#rule-action').popup('close');
                    var rule = Mist.ruleEditController.rule;
                    if (action == 'command') {
                        Ember.run.later(function () {
                            Mist.ruleEditController.open(rule, 'command');
                        }, 500);
                        return;
                    };
                    Mist.rulesController.updateRule(
                        rule.id, null, null, null, action);
                },


                saveClicked: function () {
                    $('#rule-command').popup('close');
                    Mist.rulesController.updateRule(
                        Mist.ruleEditController.rule.id, null, null, null,
                            'command', Mist.ruleEditController.command);
                },


                customClicked: function () {
                    $('#rule-metric').popup('close');
                    Ember.run.next(function () {
                        Mist.metricAddController.open(
                            Mist.ruleEditController.rule.machine, function (metric) {
                                Mist.rulesController.updateRule(
                                    Mist.ruleEditController.rule.id, metric.id);
                            }
                        );
                    });
                },
            },


            //
            //
            //  Observers
            //
            //
        });
    }
);
