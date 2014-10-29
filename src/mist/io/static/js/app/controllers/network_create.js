define('app/controllers/network_create', ['ember'],
    //
    //  Network Create Controller
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


            network: Ember.Object.create({
                name: null,
                backend: null,
                createSubnet: null,
                clear: function () {
                    this.setProperties({
                        name: null,
                        backend: null,
                        createSubnet: null,
                    });
                    this.subnet.clear();
                },
                subnet: Ember.Object.create({
                    ipv: null,
                    name: null,
                    address: null,
                    gatewayIP: null,
                    disableGateway: null,
                    clear: function () {
                        this.setProperties({
                            ipv: null,
                            name: null,
                            address: null,
                            gatewayIP: null,
                            disableGateway: null,
                        })
                    }
                }),
            }),


            //
            //
            //  Methods
            //
            //


            open: function () {
                this._clear();
                this.view.open();
            },


            selectBackend: function (backend) {
                this.network.set('backend', backend);
            },


            selectIpv: function (ipv) {
                this.network.subnet.set('ipv', ipv);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.network.clear();
                this.view.clear();
            }
        });
    }
);
