define('app/controllers/script_run', ['ember'],
    //
    //  Script Run Controller
    //
    // @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            scriptToRun: Ember.Object.create({
                machine: '',
                parameters: ''
            }),

            open: function () {
                this.clear();
                this.view.open();
            }

            close: function () {
                this.view.close();
                this.clear();
            },

            clear: function () {
                this.get('scriptToRun').setProperties({
                    machine: '',
                    parameters: '',
                });
            },

            run: function () {
                Mist.scriptsController.run(this.get('scriptToRun'));
            },

        });
    }
);
