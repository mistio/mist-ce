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
                    if (this.ruleExists(rule.id)) return;
                    rule.actionToTake = rule.action;
                    rule.operator = this.getOperatorByTitle(rule.operator);
                    rule.metric = Mist.metricsController.getMetric(rule.metric);
                    rule.machine = Mist.backendsController.getMachine(
                        rule.machine, rule.backend) || rule.machine;
                    this.content.addObject(Rule.create(rule));
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


            ruleExists: function (ruleId) {
                return !!this.getRuleById(ruleId);
            },


            getRuleById: function(ruleId) {
                return this.content.findBy('id', ruleId);
            },


            getOperatorByTitle: function(ruleTitle) {
                return this.operatorList.findBy('title', ruleTitle);
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
                    Mist.notificationController.notify('Error while deleting rule: ' + message);
                    rule.set('pendingAction', false);
                });
            },


            _deleteRule: function (rule) {
                Ember.run(this, function () {
                    this.content.removeObject(rule);
                    this.trigger('onRuleDelete');
                });
            },

            updateRule: function(id, metric, operator, value, actionToTake, command, callback) {

                var rule = this.getRuleById(id);

                if (!rule) {
                    return false;
                }

                // Make sure parameters are not null
                if (!value) { value = rule.value; }
                if (!metric) { metric = rule.metric.id; }
                if (!command) { command = rule.command; }
                if (!operator) { operator = rule.operator; }
                if (!actionToTake) { actionToTake = rule.actionToTake; }

                // Check if anything changed
                if (value == rule.value &&
                    metric == rule.metric.id &&
                    command == rule.command &&
                    actionToTake == rule.actionToTake &&
                    operator.title == rule.operator.title ) {
                        return false;
                }

                var that = this;
                rule.set('pendingAction', true);
                Mist.ajax.POST('/rules', {
                    'id': id,
                    'value': value,
                    'metric': metric,
                    'command': command,
                    'operator': operator.title,
                    'action': actionToTake,
                }).success(function(data) {
                    info('Successfully updated rule ', id);
                    rule.set('pendingAction', false);
                    rule.set('value', value);
                    rule.set('metric', Mist.metricsController.getMetric(metric));
                    rule.set('command', command);
                    rule.set('operator', operator);
                    rule.set('actionToTake', actionToTake);

                    var maxvalue = parseInt(rule.maxValue);
                    var curvalue = parseInt(rule.value);
                    if (curvalue > maxvalue) {
                        rule.set('value', maxvalue);
                    }
                }).error(function(message) {
                    Mist.notificationController.notify('Error while updating rule: ' + message);
                    rule.set('pendingAction', false);
                }).complete(function (success, data) {
                    if (callback) callback(success, data);
                });
            }
        });
    }
);
