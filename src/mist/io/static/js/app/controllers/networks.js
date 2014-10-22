define('app/controllers/networks', ['app/models/network'],
	//
	//  Networks Controller
	//
	//	@returns Class
	//
	function (Network) {

		'use strict';

		return Ember.ArrayController.extend(Ember.Evented, {


			//
			//
			//  Properties
			//
			//


			content: null,
			loading: null,
			backend: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('content', []);
                this.set('loading', true);
            },


            //
            //
            //  Methods
            //
            //


            load: function (networks) {
                this._updateContent(networks);
                this.set('loading', false);
            },


            getNetwork: function (networkId) {
                return this.content.findBy('id', networkId);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _updateContent: function (networks) {
                Ember.run(this, function () {

                    // Remove deleted networks
                    this.content.forEach(function (network) {
                        if (!networks.findBy('id', network.id))
                            this.content.removeObject(network);
                    }, this);

                    networks.forEach(function (network) {

                        var oldNetwork = this.getNetwork(network.id);

                        if (oldNetwork)
                            // Update existing networks
                            forIn(network, function (value, property) {
                                oldNetwork.set(property, value);
                            });
                        else
                            // Add new networks
                            this._addNetwork(network);
                    }, this);

                    this.trigger('onNetworkListChange');
                });
            },


            _addNetwork: function (network) {
                Ember.run(this, function () {
                    network.backend = this.backend;
                    this.content.addObject(Network.create(network));
                    this.trigger('onNetworkAdd');
                });
            },


            _deleteNetwork: function (networkId) {
                Ember.run(this, function () {
                    this.content.removeObject(this.getNetwork(networkId));
                    this.trigger('onNetworkDelete');
                });
            }
		});
	}
);