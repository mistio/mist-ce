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


            //
            //  Initialization
            //

            load: function () {
                // Add event listeners
                Mist.backendsController.on('onSelectedNetworksChange', this, 'updateFooter');
                this.updateFooter();
            }.on('didInsertElement'),

            unload: function () {
                // Remove event listeners
                Mist.keysController.off('onSelectedNetworksChange', this, 'updateFooter');
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
                                paragraph: 'Are you sure you want to delete these networks: ' +
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
                            if (backend.enabled) {
                                backend.networks.model.forEach(function (network) {
                                    console.log(network);
                                    console.log(mode);
                                    network.set('selected', mode);
                                });
                            }                        
                        });
                    });
                }
            }
        });
    }
);
