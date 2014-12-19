define('app/models/network', ['ember'],
    //
    //  Network Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            id: null,
            name: null,
            status: null,
            subnets: null,
            ipaddresses: null,
            backend: null,
            selected: null,
        });
    }
);
