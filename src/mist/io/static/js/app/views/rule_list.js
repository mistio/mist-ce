define('app/views/rule_list', ['app/views/templated'],
	//
	//  Rule List View
	//
	//  @returns Class
	//
	function (TemplatedView) {

		'use strict';

		return App.RuleListView = TemplatedView.extend({


			//
			//
			//  Properties
			//
			//


			rules: null,

		});
	}
);
