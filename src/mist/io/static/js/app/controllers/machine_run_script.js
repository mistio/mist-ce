define('app/controllers/machine_run_script', ['ember'],
    //
    //  Machine Run Script Controller
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
            runningScript: null,
            isReady: Ember.computed('scriptToRun.script', 'runningScript', function () {
                return this.get('scriptToRun.script.id') && !this.get('runningScript');
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
                this.view.open();
            },

            close: function () {
                this.view.close();
            },

            runScript: function() {
                if (this.isReady) {
                    this.set('runningScript', true);
                    var that = this;
                    Mist.scriptsController.runScript({
                        script: that.get('scriptToRun'),
                        callback: function(success) {
                            that.set('runningScript', false);
                            if (success) {
                                that.close();
                                that.get('scriptToRun').set('script', {})
                                that.get('scriptToRun').set('parameters', '')
                            }
                        }
                    });
                }
            }

        });
    }
);
