define('app/views/network', ['app/views/mistscreen'],
    //
    //  Network View
    //
    //  @returns Class
    //
    function (Mistscreen) {

        'use strict';

        return Mistscreen.extend({


            //
            //
            //  Properties
            //
            //


            network: null,
            extra: null,


            //
            //
            //  Initialization
            //
            //


            load: function() {

                // Add Event listeners
                Mist.backendsController.one('onNetworkListChange', this, 'load');

                Ember.run(this, function() {
                    this.updateCurrentNetwork();
                    if (this.network.id) {
                        this.updateExtra();
                    }
                });
            }.on('didInsertElement'),


            unload: function() {

                // Remove event listeners
                Mist.backendsController.off('onNetworksListChange', this, 'load');

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            updateCurrentNetwork: function() {
                Ember.run(this, function() {
                    var network = Mist.backendsController.getRequestedNetwork();
                    if (network)
                        this.get('controller').set('model', network);

                    this.set('network', this.get('controller').get('model'));
                    if (this.network.id) {
                        this.updateExtra();
                    }
                });
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                deleteClicked: function () {
                    var that = this;
                    var networkId = this.network.id;
                    Mist.confirmationController.setUp('Delete network',
                        'Are you sure you want to delete "' + this.network.name + '" ?', function () {
                            that.network.backend.networks.deleteNetwork(networkId,
                                function (success) {
                                    if (success)
                                        Mist.Router.router.transitionTo('networks');
                            });
                        }
                    );
                },

                reservedToggleSwitched: function() {
                    alert('yo!');
                }
            },


            //
            //
            //  Observers
            //
            //


            updateExtra: function () {
                var newExtra = [];
                if (this.network.extra instanceof Object)
                    forIn(this.network.extra, function (value, key) {
                        newExtra.push({
                            key: key,
                            value: value,
                        });
                    });
                this.set('extra', newExtra);
                Ember.run.next(function () {
                    $('#single-network-extra').collapsible();
                });
            }.observes('network.extra.@each'),
        });
    }
);
