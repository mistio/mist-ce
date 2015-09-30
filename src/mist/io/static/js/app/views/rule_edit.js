define('app/views/rule_edit', ['app/views/controlled'],
    //
    //  Rule Edit View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        return App.RuleEditComponent = ControlledComponent.extend({

            //
            //  Properties
            //

            layoutName: 'rule_edit',
            controllerName: 'ruleEditController',
            rule: null,
            metrics: [],
            newCommand: null,
            commandFormReady: false,

            sortedMetrics: function () {
                var metrics = this.get('metrics');
                if (metrics)
                    return metrics.sortBy('lowerName');
                return [];
            }.property('metrics'),


            //
            //  Methods
            //

            open: function (property, el) {

                this.set('rule', Mist.ruleEditController.rule);
                this.set('metrics', this.parentView.metrics);

                // Get button on which to position the popup
                var button = el ?
                '#' + el + ' .rule-button.rule-' + property :
                '#' + this.rule.id + ' .rule-button.rule-' + property;

                // Reposition popup on the button
                $('#rule-' + property)
                    .popup('option', 'positionTo', button);

                // Open the popup
                Ember.run.next(function () {
                   $('#rule-' + property).popup('open');
                });
            },

            close: function (property) {
                $('#rule-' + property).popup('close');
            },

            openCommandEditor: function () {
                Mist.ruleEditController.close('action');
                this.updateCommandFormReady();
                Ember.run.later(this, function () {
                    Mist.ruleEditController.open(this.rule, 'command');
                    this.set('newCommand', this.rule.command);
                }, 500);
            },

            closeCommandEditor: function () {
                Mist.ruleEditController.close('command');
                Ember.run.later(this, function () {
                    Mist.ruleEditController.open(this.rule, 'action');
                }, 500);
            },

            updateCommandFormReady: function () {
                var commandFormReady = false;
                if (this.newCommand && this.newCommand.trim() ) {
                    commandFormReady = true;
                }

                this.set('commandFormReady', commandFormReady);

                if (this.commandFormReady) {
                   $('#add-command-ok').removeClass('ui-state-disabled');
                } else {
                   $('#add-command-ok').addClass('ui-state-disabled');
                }
            },


            //
            //  Actions
            //

            actions: {
                metricClicked: function (metric) {
                    Mist.ruleEditController.edit({
                        metric: metric
                    });
                },

                operatorClicked: function (operator) {
                    Mist.ruleEditController.edit({
                        operator: operator
                    });
                },

                aggregateClicked: function (aggregate) {
                    Mist.ruleEditController.edit({
                        aggregate: aggregate
                    });
                },

                actionClicked: function (action) {
                    if (action == 'command')
                        this.openCommandEditor();
                    else
                        Mist.ruleEditController.edit({
                            action: action
                        });
                },

                saveClicked: function () {
                    if (this.commandFormReady) {
                        Mist.ruleEditController.edit({
                            action: 'command',
                            command: this.newCommand
                        });
                    }
                },

                backClicked: function () {
                    this.closeCommandEditor();
                }
            },


            //
            //  Observers
            //

            commandFormReadyObserver: function () {
               Ember.run.once(this, 'updateCommandFormReady');
            }.observes('newCommand')
        });
    }
);
