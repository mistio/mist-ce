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
            action: null

        });
    }
);
