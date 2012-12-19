define('app/views/rule', [
    'text!app/templates/rule.html','ember'],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(rule_html) {
        return Ember.View.extend({
            tagName: false,
            
            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(rule_html));
                Ember.run.next(function(){
                    $('span.ember-view.rule-metric').removeClass('ember-view');
                    $('span.ember-view.rule-operator').removeClass('ember-view');
                    $('span.ember-view.rule-action').removeClass('ember-view');
                });
            },
            
            deleteRuleClicked: function(){
                Mist.rulesController.removeObject(this.rule);
            },
            
            metricList: function() {
                return ['load', 'cpu', 'ram', 'disk', 'network'];
            }.property('metricList'),
            
            operatorList: function() {
                return [{'id': 'gt', 'title': '&gt;'}, {'id': 'lt', 'title': '&lt;'}]
            }.property('operatorList'),
            
            actionList: function() {
                return ['alert', 'reboot', 'destroy', 'launch', 'command'];
            }.property('actionList')
        });
    }
);
