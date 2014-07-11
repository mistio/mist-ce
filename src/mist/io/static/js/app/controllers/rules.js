define('app/controllers/rules', ['app/models/rule', 'ember'],
    //
    //  Rules Controller
    //
    //  @returns Class
    //
    function(Rule) {

        'use strict';

        return Ember.ArrayController.extend({

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
                if (!rules) return;
                var that = this;
                Ember.run(function() {
                    var newRules = [];
                    for (var ruleId in rules) {
                        var rule = rules[ruleId];
                        rule.id = ruleId;
                        rule.actionToTake = rules[ruleId].action;
                        rule.operator = that.getOperatorByTitle(rules[ruleId].operator);
                        rule.metric = Mist.metricsController.getMetric(rules[ruleId].metric);
                        rule.machine = Mist.backendsController.getMachine(rule.machine, rule.backend) || rule.machine;
                        newRules.push(Rule.create(rule));
                    }
                    that.set('content', newRules);
                });
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
                    Mist.rulesController.removeObject(rule);
                }).error(function(message) {
                    Mist.notificationController.notify('Error while deleting rule: ' + message);
                    rule.set('pendingAction', false);
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
