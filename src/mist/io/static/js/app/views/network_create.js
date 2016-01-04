define('app/views/network_create', ['app/views/controlled'],
    //
    //  Network Create View
    //
    //  @returns Class
    //
    function (ControlledComponent) {

        'use strict';

        var SLIDE_DOWN_DELAY = 130;

        return App.NetworkCreateComponent = ControlledComponent.extend({

            layoutName: 'network_create',
            controllerName: 'networkCreateController',

            createSubnet: false,
            disableGateway: false,
            classNameBindings: ['isDisabled:ui-disabled'],


            /**
             *  Computed Properties
             */

            isOpenstack: Ember.computed('Mist.networkCreateController.network.cloud', function() {
                return Mist.networkCreateController.network.cloud && Mist.networkCreateController.network.cloud.get('isOpenStack');
            }),

            isDisabled: Ember.computed('Mist.cloudsController.canHaveNetworks', function() {
                return !Mist.cloudsController.get('canHaveNetworks');
            }),


            /**
             *
             *  Initialization
             *
             */

             load: function () {
                Ember.run.next(function(){
                    $( "#create-network" ).collapsible({
                        expand: function(event, ui) {
                            Mist.networkCreateController.open(null);

                            var id = $(this).attr('id'),
                            overlay = id ? $('#' + id+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('ui-screen-hidden').addClass('in');
                            }
                            $(this).children().next().hide();
                            $(this).children().next().slideDown(250);
                        }
                    });
                });
             }.on('didInsertElement'),


             unload: function () {
                Ember.run.next(function(){
                    $( "#create-network" ).collapsible({
                        collapse: function(event, ui) {
                            Mist.networkCreateController.close();

                            $(this).children().next().slideUp(250);
                            var id = $(this).attr('id'),
                            overlay = id ? $('#' + id+'-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('in').addClass('ui-screen-hidden');
                            }
                        }
                    });
                });
             }.on('willDestroyElement'),


            //
            //  Methods
            //

            close: function() {
                $('#create-network').collapsible('collapse');
            },

            clear: function () {
                $('#network-create-router-form').hide();
                $('#network-create-subnet-form').hide();
                $('#network-create-subnet-address-wrapper').hide();
                $('#network-create-subnet-other-wrapper').hide();
                $('#network-create-subnet-gateway-ip-wrapper').show();
                $('#network-create .ui-collapsible')
                    .collapsible('option', 'collapsedIcon', 'carat-d')
                    .collapsible('collapse');
                $('#network-create .ui-checkbox > .ui-btn')
                    .removeClass('ui-checkbox-on')
                    .addClass('ui-checkbox-off');
				$('#network-create-router-gateway-wrapper .ui-checkbox > .ui-btn')
					.removeClass('ui-checkbox-off')
					.addClass('ui-checkbox-on');
                this.$('.ui-collapsible').removeClass('selected');
                this.renderFields();
                this._fieldIsReady('admin-state');
                this._fieldIsReady('subnet-ipv');
            },

            renderFields: function () {
                Ember.run.next(function(){
                    $('body').enhanceWithin();
                    // Render collapsibles
                    if ($('#network-create .ui-collapsible').collapsible)
                        $('#network-create .ui-collapsible').collapsible();
                    // Render listviews
                    if ($('#network-create .ui-listview').listview)
                        $('#network-create .ui-listview').listview().listview('refresh');
                    // Render checkboxes
                    if ($('#network-create .ember-checkbox').checkboxradio)
                        $('#network-create .ember-checkbox').checkboxradio().checkboxradio('refresh');
                });
            },


            //
            //  Pseudo-Private Methods
            //

            _fieldIsReady: function (field) {
                $('#network-create-' + field).collapsible('collapse');
                $('#network-create-' + field).addClass('selected');
            },


            //
            //  Actions
            //

            actions: {
                clickOverlay: function() {
                    this.close();
                },

                cloudSelected: function (cloud) {
                    Mist.networkCreateController.selectCloud(cloud);
                    this._fieldIsReady('cloud');
                    this.renderFields();
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
                }
            },


            //
            //  Observers
            //

            createRouterObserver: function () {
                Ember.run.later(function () {
                    if (Mist.networkCreateController.network.subnet.createRouter) {
                        $('#network-create-router-form').slideDown();
                    } else {
                        $('#network-create-router-form').slideUp();
                    }
                }, SLIDE_DOWN_DELAY);
            }.observes('Mist.networkCreateController.network.subnet.createRouter'),

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
