define('app/views/ip_address_list_item', ['app/views/list_item'],
    //
    //  IP Address List Item View
    //
    //  @returns Class
    //
    function (ListItemView) {

        'use strict'

        return ListItemView.extend({


            tagName: 'tr',

            actions: {

                assignClicked: function () {

                },

                reservedToggled: function () {

                }
            }
        });
    }
);
