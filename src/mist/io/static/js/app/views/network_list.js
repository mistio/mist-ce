define('app/views/network_list', ['app/views/mistscreen'],
    //
    //  Network List View
    //
    //  @returns class
    //
    function (Mistscreen) {

        'use strict';

        return Mistscreen.extend({


            createSubnet: false,

            //
            //
            //  Actions
            //
            //


            actions: {

                createClicked: function () {
                    Mist.networkCreateController.open();
                },
            }
        });
    }
);