define('app/views/network_list', ['app/views/mistscreen'],
    //
    //  Network List View
    //
    //  @returns class
    //
    function (Mistscreen) {

        'use strict';

        return Mistscreen.extend({


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

                    Mist.confirmationController.setUp('Delete networks',
                        'Are you sure you want to delete these networks: '
                        + networkNames + ' ?', function () {
                            Mist.backendsController.selectedNetworks.forEach(function (network) {
                                network.backend.networks.deleteNetwork(network.id);
                            });
                        }
                    );
                }
            }
        });
    }
);
