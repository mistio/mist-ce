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

            init: function() {
                this._super();
                /*
                Ember.run.next(function() {
                    $('span.ember-view.rule-metric').removeClass('ember-view');
                    $('span.ember-view.rule-operator').removeClass('ember-view');
                    $('span.ember-view.rule-action').removeClass('ember-view');
                });
                */
            },

            openMetricPopup: function() {
                $('#rule-metric-popup').popup('option', 'positionTo', '.rule-button.metric').popup('open');
            },

            openOperatorPopup: function() {
                $('#rule-operator-popup').popup('option', 'positionTo', '.rule-button.operator').popup('open');
            },

            openActionPopup: function() {
                $('#rule-action-popup').popup('option', 'positionTo', '.rule-button.action').popup('open');
            },

            deleteRuleClicked: function(){
                Mist.rulesController.removeObject(this.rule);
            },

/*
            metricList: function() {
                return ['load', 'cpu', 'ram', 'disk', 'network'];
            }.property('metricList'),

            operatorList: function() {
                return [{'id': 'gt', 'title': '>'}, {'id': 'lt', 'title': '<'}]
            }.property('operatorList'),

            actionList: function() {
                return ['alert', 'reboot', 'destroy', 'launch', 'command'];
            }.property('actionList')
*/
        });
    }
);
