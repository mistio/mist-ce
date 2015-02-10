define('app/views/script_list', ['app/views/mistscreen'],
    //
    //  Script List View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return PageView.extend({


            //
            //
            //  Actions
            //
            //


            actions: {

                addClicked: function () {
                    Mist.scriptAddController.open();
                }
            }
        });
    }
);
