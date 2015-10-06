define('app/controllers/machine_run_script', ['ember'],
    //
    //  Machine Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {

            //
            //  Properties
            //

            scriptToRun: Ember.Object.create({
                script: {},
                machine: '',
                parameters: ''
            }),

            //
            //  Methods
            //

            open: function (machine) {
                this.get('scriptToRun').setProperties({
                    script: {},
                    machine: machine,
                    parameters: '',
                });
                // Mist.scriptRunController.get('scriptToRun').set('machine', machine);
                this.view.open();
            },

            close: function () {
                this.view.close();
            },

        });
    }
);
