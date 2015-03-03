define('app/controllers/machine_edit', ['ember'],
    //
    //  Machine Edit Controller
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


            machine: null,
            newName: '',


            //
            //
            //  Methods
            //
            //


            open: function (machine) {
                this.setProperties({
                    machine: machine,
                    newName: machine.name
                });
                this.view.open();
            },


            close: function () {
                this.view.close();
            },


            save: function () {
                //TODO
            }
        });
    }
);
