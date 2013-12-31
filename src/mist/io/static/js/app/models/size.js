define('app/models/size', ['ember'],
    /**
     *  Size Model
     *
     *  @returns Class
     */
    function () {
        return Ember.Object.extend({

            /**
             *  Properties
             */

            id: null,
            ram: null,
            name: null,
            disk: null,
            price: null,
            driver: null,
            bandwidth: null

        });
    }
);
