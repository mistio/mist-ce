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

            load: function () {
                var list = this.get('ipaddress_list_status') || [];
                list.forEach(function (ip, index) {
                    // Make ips observable objects
                    ip = list[index] = Ember.Object.create(ip);
                    ip.set('server', Ember.Object.create(ip.get('server')));
                });
            }.on('init')
        });
    }
);
