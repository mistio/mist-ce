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
                $('#rule-metric-popup').popup('option', 'positionTo', '.rule-button.metric').popup('open');
                $('#rule-metric-popup li a').on('click', this.rule, this.selectMetric);
            },

            selectMetric: function(event) {
                var rule = event.data;
                var metric = this.title;
                rule.set('metric', metric);
                $('#rule-metric-popup').popup('close');
                $('#rule-metric-popup li a').off('click', this.selectMetric);
                return false;
            },

            openOperatorPopup: function() {
                $('#rule-operator-popup').popup('option', 'positionTo', '.rule-button.operator').popup('open');
                $('#rule-operator-popup li a').on('click', this.rule, this.selectOperator);
            },

            selectOperator: function(event) {
                var rule = event.data;
                var operator = {
                    'title': this.title,
                    'symbol': this.text
                };
                rule.set('operator', operator);
                $('#rule-operator-popup').popup('close');
                $('#rule-operator-popup li a').off('click', this.selectOperator);
                return false;
            },

            openActionPopup: function() {
                $('#rule-action-popup').popup('option', 'positionTo', '.rule-button.action').popup('open');
                $('#rule-action-popup li a').on('click', this.rule, this.selectAction);
            },

            selectAction: function(event) {
                var rule = event.data;
                var action = this.title;
                rule.set('autoAction', action);
                $('#rule-action-popup').popup('close');
                $('#rule-action-popup li a').off('click', this.selectAction);
                return false;
            },

            deleteRuleClicked: function(){
                Mist.rulesController.removeObject(this.rule);
            }
        });
    }
);
