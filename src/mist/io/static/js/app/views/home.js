define('app/views/home', ['app/views/mistscreen'],
    //
    //  Home View
    //
    //  @returns Class
    //
    function (MistScreen) {

        'use strict';

        return MistScreen.extend({


            //
            //
            //  Actions
            //
            //


            actions: {

                addBackend: function () {
                    Mist.backendAddController.open();
                }
            }
        });
    }
);
