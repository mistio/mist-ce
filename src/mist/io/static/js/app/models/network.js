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
			cidr: null,
			extra: null,
			backend: null,
			selected: null,
			floating_ips: null,

		});
	}
);
