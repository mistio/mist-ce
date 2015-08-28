define('app/views/network_list_item', ['app/views/list_item'],
	//
	//	Network List Item View
	//
	//	@returns Class
	//
	function (ListItemComponent) {

		'use strict';

		return App.NetworkListItemComponent = ListItemComponent.extend({
			layoutName: 'network_list_item'
		});

	}
);
