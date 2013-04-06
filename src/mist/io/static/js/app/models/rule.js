define('app/models/rule', ['ember'],
    /**
     *
     * Rule model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({

            machine: null,
            metric: null,
            operator: null,
            value: null,
            autoAction: null

        });
    }
);
