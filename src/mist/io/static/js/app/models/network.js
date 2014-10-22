define('app/models/network', ['ember'],
	//
	//	Network Model
	//
	//	@returns Class
	//
	function () {

		'use strict';

		return Ember.Object.extend({


			//
			//
			//  Properties
			//
			//


			id: null,
			name: null,
			extra: null,
			cidr: null,
			selected: null,
			floating_ips: null,

		});
	}
);
