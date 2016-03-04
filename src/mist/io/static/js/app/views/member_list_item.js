define('app/views/member_list_item', ['app/views/list_item'],
    //
    //  Member List Item View
    //
    //  @returns Class
    //
    function (ListItemComponent) {

        'use strict';

        return App.MemberListItemComponent = ListItemComponent.extend({

            //
            //  Properties
            //

            layoutName: 'member_list_item',
            member: null,

        });
    }
)
