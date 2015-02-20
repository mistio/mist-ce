define('app/views/network_create', ['app/views/panel'],
    //
    //  Network Create View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        var SLIDE_DOWN_DELAY = 130;

        return App.NetworkCreateView = PanelView.extend({


            createSubnet: false,
            disableGateway: false,


            //
            //
            //  Methods
            //
            //


            clear: function () {
                $('#network-create-name-wrapper').hide();
                $('#network-create-admin-state-wrapper').hide();
                $('#network-create-admin-state-wrapper').hide();
                $('#network-create-subnet-wrapper').hide();
                $('#network-create-subnet-form').hide();
                $('#network-create-subnet-address-wrapper').hide();
                $('#network-create-subnet-other-wrapper').hide();
                $('#network-create-subnet-gateway-ip-wrapper').show();
                $('#network-create .ui-collapsible')
                    .collapsible('option', 'collapsedIcon', 'arrow-d')
                    .collapsible('collapse');
                $('#network-create .ui-checkbox > .ui-btn')
                    .removeClass('ui-checkbox-on')
                    .addClass('ui-checkbox-off');
                this.renderFields();
                this._fieldIsReady('admin-state');
                this._fieldIsReady('subnet-ipv');
            },


            renderFields: function () {
                Ember.run.next(function () {
                    // Render collapsibles
                    if ($('#network-create .ui-collapsible').collapsible)
                        $('#network-create .ui-collapsible').collapsible();
                    // Render listviews
                    if ($('#network-create .ui-listview').listview)
                        $('#network-create .ui-listview').listview()
                            .listview('refresh');
                });
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _fieldIsReady: function (field) {
                $('#network-create-' + field)
                    .collapsible('option', 'collapsedIcon', 'check')
                    .collapsible('collapse');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                backendSelected: function (backend) {
                    Ember.run.later(function () {
                        $('#network-create-name-wrapper').slideDown();
                    }, SLIDE_DOWN_DELAY);
                    Mist.networkCreateController.selectBackend(backend);
                    this._fieldIsReady('backend');
                },


                adminStateSelected: function (isUp) {
                    Mist.networkCreateController.selectAdminState(isUp);
                    this._fieldIsReady('admin-state')
                },


                ipvSelected: function (ipv) {
                    Mist.networkCreateController.selectIpv(ipv);
                    this._fieldIsReady('subnet-ipv');
                },


                backClicked: function () {
                    Mist.networkCreateController.close();
                },


                createClicked: function () {
                    Mist.networkCreateController.create();
                },
            },


            //
            //
            //  Observers
            //
            //


            networkNameObserver: function () {
                Ember.run.later(function () {
                    if (Mist.networkCreateController.network.name) {
                        $('#network-create-subnet-wrapper').slideDown();
                        $('#network-create-admin-state-wrapper').slideDown();
                    }
                }, SLIDE_DOWN_DELAY);
            }.observes('Mist.networkCreateController.network.name'),


            createSubnetObserver: function () {
                Ember.run.later(function () {
                    if (Mist.networkCreateController.network.createSubnet) {
                        $('#network-create-subnet-form').slideDown();
                        $('#network-create-subnet-name-wrapper').slideDown();
                    } else {
                        $('#network-create-subnet-form').slideUp();
                    }
                }, SLIDE_DOWN_DELAY);
            }.observes('Mist.networkCreateController.network.createSubnet'),


            subnetNameObserver: function () {
                Ember.run.later(function () {
                    if (Mist.networkCreateController.network.subnet.name)
                        $('#network-create-subnet-address-wrapper').slideDown();
                }, SLIDE_DOWN_DELAY);
            }.observes('Mist.networkCreateController.network.subnet.name'),


            subnetAddressObserver: function () {
                Ember.run.later(function () {
                    if (Mist.networkCreateController.network.subnet.address)
                        $('#network-create-subnet-other-wrapper').slideDown();
                }, SLIDE_DOWN_DELAY);
            }.observes('Mist.networkCreateController.network.subnet.address'),


            subnetEnableGatewayObserver: function () {
                Ember.run.later(function () {
                    if (Mist.networkCreateController.network.subnet.disableGateway)
                        $('#network-create-subnet-gateway-ip-wrapper').slideUp();
                    else
                        $('#network-create-subnet-gateway-ip-wrapper').slideDown();
                }, SLIDE_DOWN_DELAY);
            }.observes('Mist.networkCreateController.network.subnet.disableGateway')
        });
    }
);
