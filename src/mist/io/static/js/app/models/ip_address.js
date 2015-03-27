define('app/models/ip_address', ['app/models/base'],
    //
    //  IP Address Model
    //
    //  @returns Class
    //
    function (BaseModel) {

        'use strict';

        return BaseModel.extend({


            //
            //
            //  Properties
            //
            //


            server: null,
            reserved: null,


            //
            //
            //  Initialization
            //
            //


            load: function (data) {
                this.update(this);
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            reserve: function (args) {
                this.get('network').get('cloud').get('networks').reserveIP({
                    callback: args.callback,
                    reserve: args.reserve,
                    network: this.get('network'),
                    ip: this,
                });
            },


            update: function (data) {
                if (data.server) {
                    data.server = Ember.Object.create(data.server);
                } else {
                    data.server = Ember.Object.create({name: null});
                }
                this._super(data);
            }
        });
    }
);
