define('app/views/network_create', ['app/views/panel'],
    //
    //  Network Create View
    //
    //  @returns Class
    //
    function (PanelView) {

        'use strict';

        return PanelView.extend({


            createSubnet: false,
            disableGateway: false,


            //
            //
            //  Actions
            //
            //


            actions: {

                toggleCreateSubnet: function () {
                    this.set('createSubnet', !this.createSubnet);
                    if (this.createSubnet) {
                        $('#network-create-subnet-create-form').slideDown(200);
                    } else {
                        $('#network-create-subnet-create-form').slideUp(200);
                    }
                },

                toggleDisableGateway: function () {
                    this.set('disableGateway', !this.disableGateway);
                    if (this.disableGateway) {
                        $('#network-create-subnet-gateway').slideUp(200);
                    } else {
                        $('#network-create-subnet-gateway').slideDown(200);
                    }
                },

                selectIPVersion: function (ipv) {
                    this.set('ipVersion', ipv);
                    $('#network-create-subnet-ip-version').collapsible('collapse');
                },


                backClicked: function () {
                    Mist.networkCreateController.view.close();
                },


                createClicked: function () {
                    // TODO(gtsop)
                },
            }
        });
    }
);