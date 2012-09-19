define('app/views/enable_backend_button', ['ember'],
    /**
     * Enable Backend button view
     *
     * @returns Class
     */
    function() {
        return Ember.Select.extend({
            content: ['on', 'off'],
            
            attributeBindings:['data-role'],
            
            'data-role': 'slider',

        });
        
        
    }
);
