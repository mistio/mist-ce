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
            //  Initialization
            //
            //


            load: function() {

                // Add Event listeners
                Mist.backendsController.one('onNetworkListChange', this, 'load');

                Ember.run(this, function() {
                    this.updateCurrentNetwork();
                    if (this.network.id) {
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
                    }
                });
            },

        });
    }
);
