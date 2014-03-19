define('app/controllers/rules', ['app/models/rule', 'ember'],
    /**
     *  Rules Controller
     *
     *  @returns Class
     */
    function(Rule) {
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


            operatorList: [
                {'title': 'gt', 'symbol': '>'},
                {'title': 'lt', 'symbol': '<'}
            ],


            actionList: [
                'alert',
                'reboot',
                'destroy',
                //'launch',
                'command'
            ],


            setContent: function(rules) {
                if (!rules) return;
                var that = this;
                Ember.run(function() {
                    for (ruleId in rules) {
                        var rule = rules[ruleId];
                        rule.id = ruleId;
                        rule.maxValue = rules[ruleId].max_value;
                        rule.actionToTake = rules[ruleId].action;
                        rule.operator = that.getOperatorByTitle(rules[ruleId].operator);
                        rule.machine = Mist.backendsController.getMachine(rule.machine, rule.backend) || rule.machine;
                        that.content.pushObject(Rule.create(rule));
                    }
                });
            },


            getRuleById: function(ruleId) {
                for (var i = 0; i < this.content.length; i++) {
                    if (this.content[i].id == ruleId) {
                        return this.content[i];
                    }
                }
                return null;
            },


            getOperatorByTitle: function(title) {
                var ret = null;
                this.operatorList.forEach(function(op) {
                    if (op.title == title){
                        ret = op;
                    }
                });
                return ret;
            },


            creationPendingObserver: function() {
                if (this.creatingPending) {
                    $('#add-rule-button').addClass('ui-state-disabled');
                } else {
                    $('#add-rule-button').removeClass('ui-state-disabled');
                }

            }.observes('creationPending'),


            newRule: function(machine, metric, operator, value, actionToTake) {
                this.set('creationPending', true);
                var that = this;
                Mist.ajax.POST('/rules', {
                    'backendId': machine.backend.id,
                    'machineId': machine.id,
                    'metric': metric,
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


            updateRule: function(id, metric, operator, value, actionToTake, command) {

                var rule = this.getRuleById(id);

                if (!rule) {
                    return false;
                }

                // Make sure parameters are not null
                if (!value) { value = rule.value; }
                if (!metric) { metric = rule.metric; }
                if (!command) { command = rule.command; }
                if (!operator) { operator = rule.operator; }
                if (!actionToTake) { actionToTake = rule.actionToTake; }

                // Check if anything changed
                if (value == rule.value &&
                    metric == rule.metric &&
                    command == rule.command &&
                    actionToTake == rule.actionToTake &&
                    operator.title == rule.operator.title ) {
                        return false;
                }

                // Fix value on metric change
                if ((metric != 'network-tx') && (metric != 'disk-write')) {
                    if (value > 100) {
                        value = 100;
                    }
                }


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
                    rule.set('metric', metric);
                    rule.set('command', command);
                    rule.set('operator', operator);
                    rule.set('actionToTake', actionToTake);
                    rule.set('maxValue', data.max_value);

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


            saveCommand: function() {
                $('.rule-command-popup').popup('close');
                this.updateRule(this.commandRule.id, null, null, null, 'command', this.command);
            },


            changeRuleValue: function(event) {
                var rule_id = $(event.currentTarget).attr('id');
                var rule_value = $(event.currentTarget).find('.ui-slider-handle').attr('aria-valuenow');
                this.updateRule(rule_id, null, null, rule_value);
            },


            setSliderEventHandlers: function() {
                function showSlider(event) {
                    $(event.currentTarget).addClass('open');
                    $(event.currentTarget).find('.ui-slider-track').fadeIn();
                }
                function hideSlider(event) {
                    $(event.currentTarget).find('.ui-slider-track').fadeOut();
                    $(event.currentTarget).find('.ui-slider').removeClass('open');
                    Mist.rulesController.changeRuleValue(event);
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
