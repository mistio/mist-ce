define('app/views/network_list_item', ['app/views/list_item'],
	//
	//	Network List Item View
	//
	//	@returns Class
	//
	function (ListItemComponent) {

		'use strict';

		return App.NetworkListItemComponent = ListItemComponent.extend({
			layoutName: 'network_list_item',
			network: null,
			classNameBindings: ['isDisabled'],

			/**
			 *  Computed Properties
			 */

			isDisabled: function() {
                return !this.network.get('cloud.isOpenStack');
            }.property('network.cloud.isOpenStack'),

			/**
			 *
			 *  Methods
			 *
			 */

			updateCheckbox: function () {
			    var element = $('#' + this.elementId + ' input.ember-checkbox');
			    Ember.run.next(this, function () {
			        if (element.checkboxradio) {
			            element.checkboxradio()
			                   .checkboxradio('refresh');
			        }
			    });
			},


			/**
			 *
			 *  Observers
			 *
			 */

			keySelectedObserver: function () {
			    Ember.run.once(this, 'updateCheckbox');
			}.observes('network.selected')
		});

	}
);
