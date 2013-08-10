define('app/views/rule', [
    'text!app/templates/rule.html',
    'ember'],
    /**
     *
     * Rules view
     *
     * @returns Class
     */
    function(rule_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(rule_html),

            openMetricPopup: function() {
                $('.rule-metric-popup').popup('option', 'positionTo', '#' + this.rule.id + ' .rule-button.metric').popup('open');
                $('.rule-metric-popup li a').on('click', this.rule, this.selectMetric);
            },

            selectMetric: function(event) {
                var rule = event.data;
                var metric = this.title;
                var oldmetric = rule.get('metric');

                $('.rule-metric-popup').popup('close');
                $('.rule-metric-popup li a').off('click', this.selectMetric);

                if (metric == oldmetric) {
                    return false;
                }

                warn(rule.maxValue);
                rule.set('metric', metric);
                var payload = {
                    'id' : rule.id,
                    'metric' : metric
                }

                $('#' + rule.id + ' .delete-rule-container').hide();
                $('#' + rule.id + ' .ajax-loader').fadeIn(200);
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule ', rule.id);
                        $('#' + rule.id + ' .ajax-loader').hide();
                        $('#' + rule.id + ' .delete-rule-container').show();
                        rule.set('maxValue', data['max_value']);
                        if (rule.maxValue > 100) {
                            rule.set('unit','K');
                        } else {
                            rule.set('unit','');
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        rule.set('metric', oldmetric);
                        $('#' + rule.id + ' .ajax-loader').hide();
                        $('#' + rule.id + ' .delete-rule-container').show();
                    }
                });
                return false;
            },

            openOperatorPopup: function() {
                $('.rule-operator-popup').popup('option', 'positionTo', '#' + this.rule.id + ' .rule-button.operator').popup('open');
                $('.rule-operator-popup li a').on('click', this.rule, this.selectOperator);
            },

            selectOperator: function(event) {
                var rule = event.data;
                var operator = {
                    'title': this.title,
                    'symbol': this.text
                };
                var oldoperator = rule.get('operator');

                $('.rule-operator-popup').popup('close');
                $('.rule-operator-popup li a').off('click', this.selectOperator);

                if (operator == oldoperator) {
                    return false;
                }

                rule.set('operator', operator);
                var payload = {
                    'id' : rule.id,
                    'operator' : operator.title
                }
                $('#' + rule.id + ' .delete-rule-container').hide();
                $('#' + rule.id + ' .ajax-loader').fadeIn(200);
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule ', rule.id);
                        $('#' + rule.id + ' .ajax-loader').hide();
                        $('#' + rule.id + ' .delete-rule-container').show();
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        rule.set('operator', oldoperator);
                        $('#' + rule.id + ' .ajax-loader').hide();
                        $('#' + rule.id + ' .delete-rule-container').show();
                    }
                });
                return false;
            },

            openActionPopup: function() {
                $('.rule-action-popup').popup('option', 'positionTo', '#' + this.rule.id + ' .rule-button.action').popup('open');
                $('.rule-action-popup li a').on('click', this.rule, this.selectAction);
            },

            selectAction: function(event) {
                var rule = event.data;
                var action = this.title;
                var oldAction = rule.get('actionToTake');
 
                $('.rule-action-popup').popup('close');
                $('.rule-action-popup li a').off('click', this.selectAction);

                // if 'command' is selected open the popup. Rule is updated by saveCommand()
                if (action == 'command') {
                    Mist.rulesController.set('commandRule', rule);
                    Mist.rulesController.set('command', rule.command);
                    $('.rule-command-popup').popup({
                        beforeposition: function( event, ui ) {
                            $('.rule-command-popup').css('width',0.7*$(window).width());
                        }
                    }).popup('option', 'positionTo', '#' + rule.id + ' .rule-button.command').popup('open');
                    return false;
                };

                // if the same action is selected again don't do anything
                if (action == oldAction) {
                    return false;
                }

                rule.set('actionToTake', action);

                var payload = {
                    'id' : rule.id,
                    'action' : action
                }
                $('#' + rule.id + ' .delete-rule-container').hide();
                $('#' + rule.id + ' .ajax-loader').fadeIn(200);
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule ', rule.id);
                        $('#' + rule.id + ' .ajax-loader').hide();
                        $('#' + rule.id + ' .delete-rule-container').show();
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        rule.set('actionToTake', oldAction);
                        $('#' + rule.id + ' .ajax-loader').hide();
                        $('#' + rule.id + ' .delete-rule-container').show();
                    }
                });
                return false;
            },

            deleteRuleClicked: function(){
                var that = this;
                $('#' + that.rule.id + ' .delete-rule-container').hide();
                $('#' + that.rule.id + ' .ajax-loader').fadeIn(200);
                $.ajax({
                    url: 'rules/' + that.rule.id,
                    type: 'DELETE',
                    contentType: 'application/json',
                    success: function(data) {
                        info('Successfully deleted rule ', that.rule.id);
                        Mist.rulesController.removeObject(that.rule);
                        Mist.rulesController.redrawRules();
                        $('#' + that.rule.id + ' .ajax-loader').hide();
                        $('#' + that.rule.id + ' .delete-rule-container').show();
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting rule');
                        error(textstate, errorThrown, 'while deleting rule');
                        $('#' + that.rule.id + ' .ajax-loader').hide();
                        $('#' + that.rule.id + ' .delete-rule-container').show();
                    }
                });

            }
        });
    }
);
