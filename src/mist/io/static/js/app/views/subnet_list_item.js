define('app/views/subnet_list_item', ['app/views/list_item'],
    //
    //  Subnet List Item View
    //
    //  @returns Class
    //
    function (ListItemView) {

        'use strict';

        return App.SubnetListItemView = ListItemView.extend({

            templateName: 'subnet_list_item',
            tagName: 'div'

        });
    }
);
