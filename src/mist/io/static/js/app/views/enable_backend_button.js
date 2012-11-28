define('app/views/enable_backend_button', ['ember'],
    /**
     * Enable Backend button view
     *
     * @returns Class
     */
    function() {
        return Ember.Select.extend({            
            attributeBindings:['data-role'],
            
            'data-role': 'slider',
            
        });
        
        
    }
);
