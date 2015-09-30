define('app/models/command', ['ember'],
    /**
     *  Command Model
     *
     *  @returns Class
     */
    function() {
        return Ember.Object.extend({

            //
            //  Properties
            //

            id: null,
            command: null,
            response: null,
            pendingResponse: null
        });
    }
);
