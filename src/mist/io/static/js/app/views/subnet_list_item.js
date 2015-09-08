define('app/views/subnet_list_item', ['app/views/list_item'],
    //
    //  Subnet List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict';

        return App.SubnetListItemComponent = ListItemComponent.extend({
            layoutName: 'subnet_list_item',
            tagName: 'div'
        });
    }
);
