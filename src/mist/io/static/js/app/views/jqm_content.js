define('app/views/jqm_content', ['text!app/templates/content.html', 'ember'],
    /**
     *
     * Generic JQM content
     *
     * @returns Class
     */
    function(content_html) {
        return Ember.View.extend({
    
            attributeBindings: [
                    'data-role',
                ],
                
            template: Ember.Handlebars.compile(content_html ),

            init: function() {
                this._super();
                this['data-role'] = 'content';
            },
        });
    }
);
