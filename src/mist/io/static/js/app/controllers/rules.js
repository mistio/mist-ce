define('app/controllers/rules', ['app/models/rule', 'ember'],
    //
    //  Rules Controller
    //
    //  @returns Class
    //
    function (Rule) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {

            content: [],
            command: null,
            commandRule: null,
            creationPending: false,

            aggregateList: [{
                'title': 'any',
                'value': 'any'
            }, {
                'title': 'every',
                'value': 'all'
            }, {
                'title': 'average',
                'value': 'avg'
            }],

            operatorList: [{
                'title': 'gt',
                'symbol': '>'
            }, {
                'title': 'lt',
                'symbol': '<'
            }],

            actionList: [
                'alert',
                'reboot',
                'destroy',
                'command'
            ],


            setContent: function(rules) {
                this._updateContent(rules);
            },


            _addRule: function (rule) {
                Ember.run(this, function () {
                    rule.actionToTake = rule.action;
                    rule.operator = this.getOperatorByTitle(rule.operator);
                    rule.metric = Mist.metricsController.getMetric(rule.metric);
                    rule.machine = Mist.backendsController.getMachine(
                        rule.machine, rule.backend) || rule.machine;
                    this.content.pushObject(Rule.create(rule));
                    this.trigger('onRuleAdd');
                });
            },


            _updateRule: function (oldRule, newRule) {
                Ember.run(this, function () {
                    oldRule.set('actionToTake', newRule.action);
                    oldRule.set('operator', this.getOperatorByTitle(newRule.operator));
                    oldRule.set('metric', Mist.metricsController.getMetric(newRule.metric));
                    oldRule.set('machine', Mist.backendsController.getMachine(
                        newRule.machine, newRule.backend) || newRule.machine);
                    info(newRule.aggregate);
                    oldRule.set('aggregate', this.getAggregateByValue(newRule.aggregate))
                    oldRule.set('timeWindow', newRule.reminder_offset);
                    this.trigger('onRuleUpdate');
                });
            },


            _updateContent: function (rules) {
                Ember.run(this, function() {

                    // Remove deleted rules
                    this.content.forEach(function (rule) {
                        if (!rules[rule.id])
                            this._deleteRule(rule);
                    }, this);

                    forIn(this, rules, function (rule, ruleId) {

                        rule.id = ruleId;

                        var oldRule = this.getRuleById(ruleId);

                        if (oldRule)
                            this._updateRule(oldRule, rule);
                        else
                            // Add new rules
                            this._addRule(rule);
                    });

                    this.trigger('onRuleListChange');
                });
            },


            getRuleById: function(ruleId) {
                return this.content.findBy('id', ruleId);
            },


            getOperatorByTitle: function(ruleTitle) {
                return this.operatorList.findBy('title', ruleTitle);
            },


            getAggregateByValue: function (aggregateValue) {
                return this.aggregateList.findBy('value', aggregateValue);
            },

            creationPendingObserver: function() {
                if (this.creationPending)
                    $('#add-rule-button').addClass('ui-state-disabled');
                else
                    $('#add-rule-button').removeClass('ui-state-disabled');
            }.observes('creationPending'),


            newRule: function(machine, metric, operator, value, actionToTake) {
                this.set('creationPending', true);
                var that = this;
                Mist.ajax.POST('/rules', {
                    'backendId': machine.backend.id,
                    'machineId': machine.id,
                    'metric': metric.id,
                    'operator': operator.title,
                    'value': value,
                    'action': actionToTake
                }).success(function(data) {
                    info('Successfully created rule ', data.id);
                    that.set('creationPending', false);
                    var rule = Rule.create({
                        'id': data.id,
                        'value': value,
                        'metric': metric,
                        'machine': machine,
                        'operator': operator,
                        'maxValue': data.max_value,
                        'actionToTake': actionToTake,
                    });
                    that.pushObject(rule);
                }).error(function(message) {
                    Mist.notificationController.notify('Error while creating rule: ' + message);
                    that.set('creationPending', false);
                });
            },


            deleteRule: function (rule) {
                var that = this;
                rule.set('pendingAction', true);
                Mist.ajax.DELETE('/rules/' + rule.id, {
                }).success(function(){
                    that._deleteRule(rule);
                }).error(function(message) {
                    Mist.notificationController.notify(
                        'Error while deleting rule: ' + message);
                    rule.set('pendingAction', false);
                });
            },


            _deleteRule: function (rule) {
                Ember.run(this, function () {
                    this.content.removeObject(rule);
                    this.trigger('onRuleDelete');
                });
            },


            editRule: function (args) {

                var payload = {
                    id: args.rule.id
                };

                // Construct payload
                forIn(args.properties, function (value, property) {
                    payload[property] = value;
                });

                args.rule.set('pendingAction', true);
                Mist.ajax.POST('/rules',
                    payload
                ).error(function(message) {
                    Mist.notificationController.notify(
                        'Error while updating rule: ' + message);
                }).complete(function (success, data) {
                    args.rule.set('pendingAction', false);
                    if (args.callback) args.callback(success, data);
                });
            }
        });
    }
);
