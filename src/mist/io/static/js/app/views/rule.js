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
                $('.' + this.rule.id + '.rule-metric-popup').popup('option', 'positionTo', '.rule-button.metric').popup('open');
                $('.' + this.rule.id + '.rule-metric-popup li a').on('click', this.rule, this.selectMetric);
            },

            selectMetric: function(event) {
                var rule = event.data;
                var metric = this.title;
                var oldmetric = rule.get('metric');
                
                $('.' + rule.id + '.rule-metric-popup').popup('close');
                $('.' + rule.id + '.rule-metric-popup li a').off('click', this.selectMetric);
                
                if (metric == oldmetric) {
                    return false;
                }
                
                rule.set('metric', metric);
                var payload = {
                    'id' : rule.id,
                    'metric' : metric
                }
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule ', rule.id); 
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        rule.set('metric', oldmetric);
                    }
                });                
                return false;
            },

            openOperatorPopup: function() {
                $('.' + this.rule.id + '.rule-operator-popup').popup('option', 'positionTo', '.rule-button.operator').popup('open');
                $('.' + this.rule.id + '.rule-operator-popup li a').on('click', this.rule, this.selectOperator);
            },

            selectOperator: function(event) {
                var rule = event.data;
                var operator = {
                    'title': this.title,
                    'symbol': this.text
                };
                var oldoperator = rule.get('operator');
                
                $('.' + rule.id + '.rule-operator-popup').popup('close');
                $('.' + rule.id + '.rule-operator-popup li a').off('click', this.selectOperator);
                
                if (operator == oldoperator) {
                    return false;
                }
                
                rule.set('operator', operator);
                var payload = {
                    'id' : rule.id,
                    'operator' : operator
                }
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule ', rule.id); 
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        rule.set('operator', oldoperator);
                    }
                });                
                return false;
            },

            openActionPopup: function() {
                $('.' + this.rule.id + '.rule-action-popup').popup('option', 'positionTo', '.rule-button.action').popup('open');
                $('.' + this.rule.id + '.rule-action-popup li a').on('click', this.rule, this.selectAction);
            },

            selectAction: function(event) {
                var rule = event.data;
                var action = this.title;
                var oldaction = rule.get('actionToTake');
                
                $('.' + rule.id + '.rule-action-popup').popup('close');
                $('.' + rule.id + '.rule-action-popup li a').off('click', this.selectAction);
                
                if (action == oldaction) {
                    return false;
                }
                
                rule.set('actionToTake', action);
                var payload = {
                    'id' : rule.id,
                    'action' : action
                }
                $.ajax({
                    url: 'rules',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully updated rule ', rule.id); 
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while updating rule');
                        error(textstate, errorThrown, 'while updating rule');
                        rule.set('actionToTake', oldaction);
                    }
                });                
                return false;
            },

            deleteRuleClicked: function(){
                var that = this;
                
                $.ajax({
                    url: 'rules/' + that.rule.id,
                    type: 'DELETE',
                    contentType: 'application/json',
                    success: function(data) {
                        info('Successfully deleted rule ', that.rule.id);
                        Mist.rulesController.removeObject(that.rule);
                        Mist.rulesController.redrawRules();         

                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting rule');
                        error(textstate, errorThrown, 'while deleting rule');
                    }
                });                
                
            }
        });
    }
);
