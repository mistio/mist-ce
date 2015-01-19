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
            //  Computed Properties
            //
            //


            assignedServer: function () {

            }.property('value', 'server'),


            isReserved: function () {

            }.property('reserved'),


            //
            //
            //  Methods
            //
            //


            reserve: function () {

            },


            unreserve: function () {

            },


            assign: function (machine) {

            },


            unassign: function () {

            }
        });
    }
);
