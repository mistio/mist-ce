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
            //  Methods
            //
            //


            reserve: function (args) {
                this.get('network').get('backend').get('networks').reserveIP({
                    callback: args.callback,
                    reserve: args.reserve,
                    network: this.get('network'),
                    ip: this,
                });
            },


            assign: function (machine) {

            },


            unassign: function () {

            }
        });
    }
);
