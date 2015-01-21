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


            value: null,
            server: null,
            reserved: null,


            //
            //
            //  Methods
            //
            //


            reserve: function (args) {
                this.get('network').get('backend').get('networks').reserveIP({
                    callback: args ? args.callback : null,
                    reserve: true,
                    ip: this,
                });
            },


            unreserve: function (args) {
                this.get('network').get('backend').get('networks').reserveIP({
                    callback: args ? args.callback : null,
                    reserve: false,
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
