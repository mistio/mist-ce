define('app/views/jqm_page', ['ember'],
    /**
     *
     * Generic JQM page
     *
     * @returns Class
     */
    function() {
        return Ember.ContainerView.extend({
    
            attributeBindings: [
                    'data-role',
                    'id'
                ],

            init: function() {
                this._super();
                this['data-role'] = 'page';
            },
        });
    }
);
