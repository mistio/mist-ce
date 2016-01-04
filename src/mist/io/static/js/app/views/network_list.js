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
            sortByTerm: 'name',

            sortByName: Ember.computed('sortByTerm', function () {
                return this.get('sortByTerm') == 'name';
            }),

            sortByProvider: Ember.computed('sortByTerm', function () {
                return this.get('sortByTerm') == 'provider';
            }),

            sortedNetworks: Ember.computed('filteredNetworks', 'filteredNetworks.@each.name', 'sortByTerm', function() {
                if(this.get('filteredNetworks'))
                {
                    if (this.get('sortByName'))
                    {
                        return this.get('filteredNetworks').sortBy('name');
                    }

                    if (this.get('sortByProvider'))
                    {
                        return this.get('filteredNetworks').sortBy('provider.title').reverse();
                    }
                }
            }),


            //
            //  Initialization
            //

            load: function () {
                // Add event listeners
                Mist.cloudsController.on('onSelectedNetworksChange', this, 'updateFooter');
                Mist.cloudsController.on('onNetworkListChange', this, 'updateFilteredNetworks');

                this.updateFilteredNetworks();
                this.updateFooter();
            }.on('didInsertElement'),

            unload: function () {
                // Remove event listeners
                Mist.cloudsController.off('onSelectedNetworksChange', this, 'updateFooter');
                Mist.cloudsController.off('onNetworkListChange', this, 'updateFilteredNetworks');
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            updateFooter: function () {
                if (Mist.cloudsController.selectedNetworks.length)
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
                    var networkNames = Mist.cloudsController
                        .selectedNetworks.toStringByProperty('name');

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete networks',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete ' + (Mist.cloudsController
                        .selectedNetworks.length > 1 ? 'these networks: ' : 'this network: ') +
                                    networkNames + ' ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                Mist.cloudsController.selectedNetworks.forEach(function (network) {
                                    network.cloud.networks.deleteNetwork(network.id);
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

                    Ember.run(this, function () {
                        this.get('filteredNetworks').forEach(function (network) {
                            if(network.cloud.enabled && network.cloud.get('isOpenStack')) {
                                network.set('selected', mode);
                            }
                        });
                    });
                },

                clearClicked: function() {
                    this.set('searchTerm', null);
                },

                sortBy: function (criteria) {
                    this.set('sortByTerm', criteria);
                }
            },

            updateFilteredNetworks: function() {
                var networks = [], filteredNetworks = [];

                Mist.cloudsController.model.forEach(function (cloud) {
                    if (cloud.get('enabled')) {
                        networks.pushObjects(cloud.networks.model);
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
                    filteredNetworks = networks;
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
