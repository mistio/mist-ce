define('app/views/network_list', ['app/views/page'],
    //
    //  Network List View
    //
    //  @returns class
    //
    function (PageView) {

        'use strict';

        return App.NetworkListView = PageView.extend({


            //
            //
            //  Initialization
            //
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
            //
            //  Methods
            //
            //


            updateFooter: function () {
                if (Mist.backendsController.selectedNetworks.length)
                    $('#network-list-page .ui-footer').slideDown();
                else
                    $('#network-list-page .ui-footer').slideUp();
            },


            //
            //
            //  Actions
            //
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
                }
            }
        });
    }
);
