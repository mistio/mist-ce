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

            metricList: [
                'load',
                'cpu',
                'ram',
                'disk-write',
                'network-tx'
            ],

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
                Ember.run(this, function() {
                    var newRules = [];
                    forIn(this, rules, function (rule, ruleId) {
                        rule.id = ruleId;
                        rule.actionToTake = rule.action;
                        rule.operator = this.getOperatorByTitle(rule.operator);
                        rule.metric = Mist.metricsController.getMetric(rule.metric);
                        rule.machine = Mist.backendsController.getMachine(
                            rule.machine, rule.backend) || rule.machine;
                        newRules.push(Rule.create(rule));
                    });
                    this.set('content', newRules);
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
                    that.redrawRules();
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
                    Mist.rulesController.redrawRules();
                }).error(function(message) {
                    Mist.notificationController.notify('Error while deleting rule: ' + message);
                    rule.set('pendingAction', false);
                });
            },


            updateRule: function(id, metric, operator, value, actionToTake, command) {

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
                });
            },


            setSliderEventHandlers: function() {
                function showSlider(event) {
                    var rule_id = $(event.currentTarget).parent().attr('id');
                    var rule = Mist.rulesController.getRuleById(rule_id);
                    if (rule.metric.hasRange) {
                        $(event.currentTarget).addClass('open');
                        $(event.currentTarget).find('.ui-slider-track').fadeIn(100);
                    }
                }
                function hideSlider(event) {
                    $(event.currentTarget).find('.ui-slider-track').fadeOut(100);
                    $(event.currentTarget).find('.ui-slider').removeClass('open');
                }
                $('.rules-container .ui-slider').on('tap', showSlider);
                $('.rules-container .ui-slider').on('click', showSlider);
                $('.rules-container .ui-slider').on('mouseover', showSlider);
                $('#single-machine').on('tap', hideSlider);
                $('.rules-container .rule-box').on('mouseleave', hideSlider);
            },


            removeSliderEventHandlers: function() {
                $('.rules-container .ui-slider').off('tap');
                $('.rules-container .ui-slider').off('click');
                $('.rules-container .ui-slider').off('mouseover');
                $('#single-machine').off('tap');
                $('.rules-container .rule-box').off('mouseleave');
            },


            redrawRules: function() {
                var that = this;
                Ember.run.next(function() {
                    that.removeSliderEventHandlers();
                    $('.rule-box').trigger('create');
                    that.setSliderEventHandlers();
                });
            },
        });
    }
);
