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

            formReady: null,
            creatingNetwork: false,
            network: Ember.Object.create({
                name: null,
                cloud: null,
                adminStateUp: true,
                createSubnet: null,
                clear: function () {
                    this.setProperties({
                        name: null,
                        cloud: null,
                        adminStateUp: true,
						createRouter: null,
                        createSubnet: null
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
                    routerName: null,
                    routerPublicGateway: true,
                    createRouter: null,
                    clear: function () {
                        this.setProperties({
                            ipv: 'IPv4',
                            name: null,
                            address: null,
                            gatewayIP: null,
                            disableGateway: null,
                            allocationPools: null,
                            hostRoutes: null,
                            enableDHCP: null,
                            DNS: null,
                            routerName: null,
                            routerPublicGateway: true,
                            createRouter: null
                        })
                    }
                })
            }),

            adminStateUpToText: function () {
                return this.network.adminStateUp ? 'UP' : 'DOWN';
            }.property('network.adminStateUp'),


            //
            //
            //  Methods
            //
            //


            open: function () {
                this._clear();
                this._updateFormReady();
            },

            close: function () {
                this._clear();
            },

            selectCloud: function (cloud) {
                this.network.set('cloud', cloud);
            },


            selectIpv: function (ipv) {
                this.network.subnet.set('ipv', ipv);
            },


            selectAdminState: function (isUp) {
                this.network.set('adminStateUp', isUp);
            },


            create: function () {

                var payload = {};
                var network = this.network;
                var subnet = network.subnet;

                // Construct network params
                payload.network = {};

                if (network.name !== null && network.name.length)
                    payload.network.name = network.name;

                if (network.adminStateUp !== null)
                    payload.network.admin_state_up = network.adminStateUp;

                // Construct subnet params
                if (network.createSubnet) {

                    payload.subnet = {};

                    if (subnet.name !== null && subnet.name.length)
                        payload.subnet.name = subnet.name;

                    if (subnet.ipv !== null)
                        payload.subnet.ip_version = subnet.ipv.charAt(3);

                    if (subnet.address !== null && subnet.address.length)
                        payload.subnet.cidr = subnet.address;

                    if (!subnet.disableGateway)
                        payload.subnet.gateway_ip = subnet.gatewayIP;

                    if (subnet.enableDHCP !== null)
                        payload.subnet.enable_dhcp = subnet.enableDHCP;

                    if (subnet.allocationPools !== null && subnet.allocationPools.length)
                        payload.subnet.allocation_pools = subnet.allocationPools
                            .split('\n')
                            .map(function (pool) {
                                var tuple = pool.split(',');
                                if (tuple.length == 2)
                                    return {
                                        start: tuple[0].trim(),
                                        end: tuple[1].trim()
                                    };
                                return {start: '', end: ''};
                            });

                    // Construct router params
                    if (subnet.createRouter) {
                        payload.subnet.router = {};

                        if (subnet.routerName) {
                            payload.subnet.router.name = subnet.routerName;
                        }

                        payload.subnet.router.publicGateway = subnet.routerPublicGateway;
                    }
                }

                var url = '/clouds/' + this.network.cloud.id +
                    '/networks';
                var that = this;
                that.set('creatingNetwork', true);
                Mist.ajax.POST(url, payload).success(function (network) {
                    that.view.close();
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success, network) {
                    that.set('creatingNetwork', false);
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
            },

            _updateFormReady: function() {
                var formReady = false;
                if (this.network.name && this.network.cloud) {
					formReady = true;

                    if (this.network.createSubnet) {
                        formReady = this.network.subnet.name ? true : false;
                    }

					if (this.network.subnet.createRouter) {
						formReady = this.network.subnet.routerName ? true : false;
					}
                }

                if (formReady && this.creatingNetwork) {
                    formReady = false;
                }

                this.set('formReady', formReady);
            },

            /**
             *
             *  Observers
             *
             */

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('network.name', 'network.cloud', 'network.createRouter', 'network.router.name')
        });
    }
);
