define('app/controllers/rules', [
    'app/models/rule',
    'ember',
    'jquery'
    ],
    /**
     *
     * Rules controller
     *
     * @returns Class
     */
    function(Rule) {
        return Ember.ArrayController.extend({
            command: null,
            commandRule: null,

            metricList: [
                'load',
                'cpu',
                'ram',
                'disk',
                'network'
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

            getRuleById: function(ruleId){
                for (var i = 0; i < this.content.length; i++){
                    if (this.content[i].id == ruleId) {
                        return this.content[i];
                    }
                }
            },
            
            getOperatorByTitle: function(title){
                var ret = null;
                this.operatorList.forEach(function(op){
                    if (op.title == title){
                        ret = op;
                    }
                });
                return ret;
            },

            newRule: function(machine, metric, operator, value, actionToTake) {
                var rule = Rule.create({
                    'machine': machine,
                    'metric': metric,
                    'operator': operator,
                    'value': value,
                    'actionToTake': actionToTake
                });
                var that = this;

                payload = {
                    'backendId': machine.backend.id,
                    'machineId': machine.id,
                    'metric': metric,
                    'operator': operator.title,
                    'value': value,
                    'action': actionToTake
                }

                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully created rule ', data['id']);
                        rule.set('id', data['id']);
                        that.pushObject(rule);
                        that.redrawRules();
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while creating rule');
                        error(textstate, errorThrown, 'while creating rule');
                    }
                });

                return rule.id;

            },

            saveCommand: function() {
                var oldAction = this.commandRule.get('actionToTake');
                var oldCommand = this.commandRule.get('command');

                $('.rule-command-popup').popup('close');

                if (this.command == oldCommand) {
                    return false;
                }
                
                warn('setting command for '+ this.commandRule.id + ' to ' + this.command);
                
                this.commandRule.set('actionToTake', 'command');
                this.commandRule.set('command', this.command);

                var payload = {
                    'id' : this.commandRule.id,
                    'action' : 'command',
                    'command': this.command
                }
                var that = this;
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule', that.commandRule.id);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        that.commandRule.set('actionToTake', oldAction);
                        that.commandRule.set('command', oldCommand);
                        that.command.set(oldCommand);
                    }
                });
            },
            
            redrawRules: function(){

                var that = this;
                Ember.run.next(function() {
                    $('.rule-button.metric').each(function(i, el){
                        $(el).button();
                    });
                    $('.rule-metric-popup').each(function(i, el){
                        $(el).popup();
                    });
                    $('.rule-metric-list').each(function(i, el){
                        $(el).listview();
                    });
                    $('.rule-button.operator').each(function(i, el){
                        $(el).button();
                    });
                    $('.rule-operator-popup').each(function(i, el){
                        $(el).popup();
                    });
                    $('.rule-operator-list').each(function(i, el){
                        $(el).listview();
                    });
                    $('.rule-value').each(function(i, el){
                        $(el).slider();
                    });
                    $('input.rule-value').each(function(i, el){
                        $(el).textinput();
                    });
                    $('.rule-button.action').each(function(i, el){
                        $(el).button();
                    });
                    $('.rule-action-popup').each(function(i, el){
                        $(el).popup();
                    });
                    $('.rule-command-content').each(function(i, el){
                        $(el).textinput();
                    });
                    $('.rule-command-popup a').each(function(i, el){
                        $(el).button();
                    });
                    $('.rule-command-popup').each(function(i, el){
                        $(el).popup();
                    });
                    $('.rule-action-list').each(function(i, el){
                        $(el).listview();
                    });
                    $('.rules-container .delete-rule-button').each(function(i, el){
                        $(el).button();
                    });

                    function showRuleSlider(event) {
                        $(event.currentTarget).find('.ui-slider-track').css('width', $(window).width()*0.3);
                        $(event.currentTarget).find('.ui-slider-track').fadeIn(100);
                    }

                    function hideRuleSlider(event){
                        $(event.currentTarget).find('.ui-slider-track').css('width','');
                        $(event.currentTarget).find('.ui-slider-track').fadeOut(100);
                        var rule_id = $(event.currentTarget).attr('id');
                        var rule_value = $(event.currentTarget).find('.ui-slider-handle').attr('aria-valuenow');
                        var rule = that.getRuleById(rule_id);
                        if (rule.value != rule_value) {
                            var payload = {
                                'id' : rule.id,
                                'value' : rule_value
                            }
                            $.ajax({
                                url: 'rules',
                                type: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify(payload),
                                success: function(data) {
                                    info('Successfully updated rule ', rule.id);
                                    rule.set('value', rule_value);
                                },
                                error: function(jqXHR, textstate, errorThrown) {
                                    Mist.notificationController.notify('Error while updating rule');
                                    error(textstate, errorThrown, 'while updating rule');
                                }
                            });
                        }

                    }

                    $('.ui-slider').off('mouseover');
                    $('.ui-slider').on('mouseover', showRuleSlider);
                    $('.ui-slider').on('click', showRuleSlider);
                    $('.ui-slider').on('tap', showRuleSlider);
                    $('.rule-box').on('mouseleave', hideRuleSlider);
                    $('#single-machine').on('tap', hideRuleSlider);
                });
            },
        });
    }
);
