define('app/views/network', ['app/views/page'],
    //
    //  Network View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return App.NetworkView = PageView.extend({

            templateName: 'network',

            //
            //  Properties
            //

            network: null,
            extra: null,
            selectedIp: null,


            //
            //  Initialization
            //

            load: function() {

                // Add Event listeners
                Mist.cloudsController.one('onNetworkListChange', this, 'load');

                Ember.run(this, function() {
                    this.updateCurrentNetwork();
                    if (this.network.id) {
                        this.updateExtra();
                    }
                    Ember.run.next(function(){
                        $('#single-network-subnets').collapsible().enhanceWithin();
                    });
                });
            }.on('didInsertElement'),


            unload: function() {

                // Remove event listeners
                Mist.cloudsController.off('onNetworkListChange', this, 'load');

            }.on('willDestroyElement'),


            //
            //  Methods
            //

            updateCurrentNetwork: function() {
                Ember.run(this, function() {
                    var network = Mist.cloudsController.getRequestedNetwork();
                    if (network)
                        this.get('controller').set('model', network);

                    this.set('network', this.get('controller').get('model'));
                    if (this.network.id) {
                        this.updateExtra();
                    }
                });
                $('#single-network-subnets').enhanceWithin();
            },


            //
            //  Actions
            //

            actions: {

                deleteClicked: function () {
                    var that = this;
                    var networkId = this.network.id;
                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete network',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete "' +
                                    this.network.name + '" ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                that.network.cloud.networks.deleteNetwork(networkId, function (success) {
                                    if (success)
                                    Mist.__container__.lookup('router:main').transitionTo('networks');
                                });
                            }
                        }
                    });
                },

                assignMachine: function (machine) {
                    var ip = this.get('selectedIp');
                    this.get('network').get('cloud').get('networks').associateIP({
                        network: this.get('network'),
                        machine: machine,
                        ip: ip,
                        callback: function (success) {
                            if (success)
                                ip.get('server').set('name', machine.get('name'));
                        }
                    });
                    $('#assign-machine').popup('close');
                },
            },


            //
            //  Observers
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
            }.observes('network.extra.[]'),
        });
    }
);
