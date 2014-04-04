define('app/controllers/machine_metric_add', ['ember'],
    //
    //  Machine Metric Add Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            view: null,
            machine: null,
            callback: null,


            //
            //
            //  Methods
            //
            //


            open: function (machine, callback) {
                this.set('machine', machine)
                    .set('callback', callback);

                this.view.open();
            },


            close: function () {
                this.clear();
                this.view.close();
            },


            add: function () {
                // An ajax call here
                // on success:
                this.close();
            },


            clear: function () {
                this.set('machine', null)
                    .set('callback', null);
            }
        });
    }
);
