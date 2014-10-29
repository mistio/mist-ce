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

            adminStateUpToText: function () {
                return this.network.adminStateUp === null ? 'Select Admin State' :
                    this.network.adminStateUp ? 'UP' : 'DOWN';
            }.property('network.adminStateUp'),

            network: Ember.Object.create({
                name: null,
                backend: null,
                adminStateUp: null,
                createSubnet: null,
                clear: function () {
                    this.setProperties({
                        name: null,
                        backend: null,
                        adminStateUp: null,
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
                    allocationPools: null,
                    hostRoutes: null,
                    enableDHCP: null,
                    DNS: null,
                    clear: function () {
                        this.setProperties({
                            ipv: null,
                            name: null,
                            address: null,
                            gatewayIP: null,
                            disableGateway: null,
                            allocationPools: null,
                            hostRoutes: null,
                            enableDHCP: null,
                            DNS: null,
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

            close: function () {
                this._clear();
                this.view.close();
            },

            selectBackend: function (backend) {
                this.network.set('backend', backend);
            },


            selectIpv: function (ipv) {
                this.network.subnet.set('ipv', ipv);
            },


            selectAdminState: function (isUp) {
                this.network.set('adminStateUp', isUp);
            },


            create: function () {

                var payload = {
                    network: {
                        name: this.network.name,
                        admin_state_up: this.network.adminStateUp,
                    }
                };

                if (this.network.createSubnet) {
                    var subnet = this.network.subnet;
                    payload.subnet = {
                        name: subnet.name,
                        ip_version: subnet.ipv.charAt(3),
                        cidr: subnet.address,
                        gateway_ip: subnet.disableGateway ? null : subnet.gatewayIP,
                        allocation_pools: subnet.allocationPools
                            .split('\n')
                            .map(function (pool) {
                                return {
                                    start: pool.split(',')[0].trim(),
                                    stop: pool.split(',')[1].trim()
                                }
                            }),
                        enable_dhcp: subnet.enableDHCP
                    }
                }

                var url = '/backends/' + this.network.backend.id +
                    '/networks';
                var that = this;
                Mist.ajax.POST(url, payload).success(function (network) {
                    info(network);
                    that.close();
                }).error(function (message) {
                    info(message);
                }).complete(function (success, network) {
                    info(success, network);
                });
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
