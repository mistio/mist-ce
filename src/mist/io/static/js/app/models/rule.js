define('app/models/rule', ['ember'],
    /**
     * Key model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            machine: null,
            metric: null,
            operator: null,
            value: null,
            action: null,
            
            jqmEmberMetricFix: function() {
                $('span.ember-view.rule-metric').removeClass('ember-view');
            }.observes('metric'),
            
            jqmEmberOperatorFix: function() {
                $('span.ember-view.rule-operator').removeClass('ember-view');
            }.observes('operator'),
            
            jqmEmberActionFix: function() {
                $('span.ember-view.rule-action').removeClass('ember-view');
            }.observes('action')

        });
    }
);
