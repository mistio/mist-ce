define('app/views/network_list', ['app/views/page'],
    //
    //  Network List View
    //
    //  @returns class
    //
    function (PageView) {

        'use strict';

        return App.NetworkListView = PageView.extend({

            templateName: 'network_list',
            filteredNetworks: null,
            searchTerm: null,


            //
            //  Initialization
            //

            load: function () {
                // Add event listeners
                Mist.backendsController.on('onSelectedNetworksChange', this, 'updateFooter');
                Mist.backendsController.on('onNetworkListChange', this, 'updateFilteredNetworks');
                this.updateFooter();
            }.on('didInsertElement'),

            unload: function () {
                // Remove event listeners
                Mist.backendsController.off('onSelectedNetworksChange', this, 'updateFooter');
                Mist.backendsController.off('onNetworkListChange', this, 'updateFilteredNetworks');
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            updateFooter: function () {
                if (Mist.backendsController.selectedNetworks.length)
                    $('#network-list-page .ui-footer').slideDown();
                else
                    $('#network-list-page .ui-footer').slideUp();
            },


            //
            //  Actions
            //

            actions: {
                createClicked: function () {
                    Mist.networkCreateController.open();
                },

                deleteClicked: function () {
                    var networkNames = Mist.backendsController
                        .selectedNetworks.toStringByProperty('name');

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete networks',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete ' + (Mist.backendsController
                        .selectedNetworks.length > 1 ? 'these networks: ' : 'this network: ') +
                                    networkNames + ' ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                Mist.backendsController.selectedNetworks.forEach(function (network) {
                                    network.backend.networks.deleteNetwork(network.id);
                                });
                            }
                        }
                    });
                },

                selectClicked: function () {
                    $('#select-networks-popup').popup('open').find('.ui-listview').listview('refresh');
                },

                selectionModeClicked: function (mode) {
                    $('#select-networks-popup').popup('close');

                    Ember.run(function () {
                        Mist.backendsController.model.forEach(function (backend) {
                            if (backend.get('enabled') && backend.get('isOpenStack')) {
                                backend.networks.model.forEach(function (network) {
                                    network.set('selected', mode);
                                });
                            }
                        });
                    });
                },

                clearClicked: function() {
                    this.set('searchTerm', null);
                },
            },

            updateFilteredNetworks: function() {
                var networks = [], filteredNetworks = [];

                Mist.backendsController.model.forEach(function (backend) {
                    if (backend.get('enabled')) {
                        networks.pushObjects(backend.networks.model);
                    }
                });

                if (this.searchTerm) {
                    var that = this;
                    networks.forEach(function(network) {
                        var regex = new RegExp(that.searchTerm, 'i');

                        if (regex.test(network.name)) {
                            filteredNetworks.push(network);
                        } else {
                            if (network.selected) {
                                network.set('selected', false);
                            }
                        }
                    });
                } else {
                    var filteredNetworks = networks;
                }

                this.set('filteredNetworks', filteredNetworks);
            },


            //
            // Observers
            //


            filteredNetworksObserver: function() {
                Ember.run.once(this, 'updateFilteredNetworks');
            }.observes('searchTerm')
        });
    }
);
