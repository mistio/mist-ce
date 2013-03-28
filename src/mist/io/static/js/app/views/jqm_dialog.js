define('app/views/jqm_dialog', ['ember'],
    /**
     *
     * Generic JQM dialog
     *
     * @returns Class
     */
    function() {
        return Ember.View.extend({
    
            attributeBindings: [
                    'data-role',
                    'id'
                ],

            init: function() {
                this._super();
                this['data-role'] = 'dialog';
            },
        });
    }
);
