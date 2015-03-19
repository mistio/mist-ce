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
                Mist.cloudsController.on('onSelectedNetworksChange', this, 'updateFooter');
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
                if (Mist.cloudsController.selectedNetworks.length)
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

                    var networkNames = Mist.cloudsController
                        .selectedNetworks.toStringByProperty('name');

                    Mist.confirmationController.setUp('Delete networks',
                        'Are you sure you want to delete these networks: '
                        + networkNames + ' ?', function () {
                            Mist.cloudsController.selectedNetworks.forEach(function (network) {
                                network.cloud.networks.deleteNetwork(network.id);
                            });
                        }
                    );
                }
            }
        });
    }
);
