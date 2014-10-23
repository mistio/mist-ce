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
            cidr: null,
            extra: null,
            backend: null,
            selected: null,
            floating_ips: null,


            //
            //
            //  Observer
            //
            //


            extraObserver: function () {

                // Make extra object an Ember object
                // so that it is observable
                Ember.run.once(this, function () {
                    if (!(this.extra instanceof Ember.Object))
                        this.set('extra', Ember.Object.create(this.extra || {}));
                });
            }.on('init').observes('extra')
        });
    }
);
