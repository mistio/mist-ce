define('app/views/enable_backend_button', ['ember'],
    /**
     * Enable Backend button view
     *
     * @returns Class
     */
    function() {
        return Ember.Select.extend({
            defaultTemplate: Ember.Handlebars.compile('{{#each view.content}}{{view Mist.FlipOption contentBinding="this"}}{{/each}}'),
            attributeBindings: ['data-role',],
            'data-role':'slider',
            optionLabelPath:"content.label",
            optionValuePath:"content.value",
            didInsertElement: function(){
                this._super();
                this.$().trigger('create');
            }            
        }); 
    }
);
