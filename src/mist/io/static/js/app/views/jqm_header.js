define('app/views/jqm_header', ['text!app/templates/header.html', 'ember'],
    /**
     *
     * Generic JQM header
     *
     * @returns Class
     */
    function(header_html) {
        return Ember.View.extend({
    
            attributeBindings: [
                    'data-role',
                ],
                
            template: Ember.Handlebars.compile(header_html ),

            init: function() {
                this._super();
                this['data-role'] = 'header';
            },
        });
    }
);
