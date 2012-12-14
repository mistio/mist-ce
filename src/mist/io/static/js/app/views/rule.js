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
            },
        });
    }
);
