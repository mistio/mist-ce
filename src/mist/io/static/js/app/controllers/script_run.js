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
                script: {},
                machine: '',
                parameters: ''
            }),

            open: function (script) {
                this.clear();
                this.get('scriptToRun').set('script', script);
                this.view.open();
            },

            close: function () {
                this.view.close();
                this.clear();
            },

            clear: function () {
                this.get('scriptToRun').setProperties({
                    script: {},
                    machine: '',
                    parameters: '',
                });
            },

            run: function () {
                var that = this;
                Mist.scriptsController.runScript({
                    script: this.get('scriptToRun'),
                    callback: function (success) {
                        if (success)
                            that.close();
                    }
                });
            },

        });
    }
);
