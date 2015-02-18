define('app/views/script', ['app/views/mistscreen'],
    //
    //  Script View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return PageView.extend({

            actions: {
                runClicked: function () {
                    info(this.get('controller').get('model'));
                    info(this.get('model'));
                    Mist.scriptRunController.open(this.get('controller').get('model'));
                }
            }
        });
    }
);
