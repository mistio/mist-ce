define('app/views/network_list_item', ['app/views/list_item'],
	//
	//	Network List Item View
	//
	//	@returns Class
	//
	function (ListItemView) {

		'use strict';

		return App.NetworkListItemView = ListItemView.extend({
			templateName: 'network_list_item'
		});

	}
);
