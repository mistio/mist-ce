define('app/models/network', [
        'app/models/base',
        'app/controllers/ip_addresses',
        'app/controllers/subnets'
    ],
    //
    //  Network Model
    //
    //  @returns Class
    //
    function (BaseModel, IPAddressesController, SubnetsController) {

        'use strict';

        return BaseModel.extend({

            //
            //  Properties
            //

            status: null,
            subnets: null,
            cloud: null,
            //ipAddresses: null,

            isPublic: Ember.computed('router_external', function() {
                return this.get('router_external') == true;
            }),

            isPrivate: Ember.computed('router_external', function() {
                return this.get('router_external') == false;
            }),


            //
            //  Methods
            //

            load: function () {
                var subnets = this.get('subnets')
                this.setProperties({
                    subnets: SubnetsController.create({ network: this, model: [] }),
                    //ipAddresses: IPAddressesController.create({ network: this, model: [] })
                });
                this._updateSubnets(subnets);
            }.on('init'),

            update: function (data) {
                // Do not modify original data because it introduces
                // debuging problems
                var newData = Ember.Object.create(data);

                if (newData.subnets) {
                    this._updateSubnets(newData.subnets);
                    delete newData.subnets;
                }
                this._super(newData);
            },

            _updateSubnets: function (subnets) {
                this.get('subnets').setModel(subnets);
            },
        });
    }
);
