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
                parameters: '',
                scheduler: '',
                interval: {
                    every: '',
                    period: ''
                },
                crontab: {
                    minute: '',
                    hour: '',
                    day_of_week: '',
                    day_of_month: '',
                    month_of_year: ''
                },
                run_at: '',
                last_run_at: ''
            }),

            load: function() {
                Ember.run.next(function() {
                    $('#datetimepicker').datetimepicker();
                });
            }.on('didInsertElement'),

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
                    scheduler: '',
                    interval: {
                        every: '',
                        period: ''
                    },
                    crontab: {
                        minute: '',
                        hour: '',
                        day_of_week: '',
                        day_of_month: '',
                        month_of_year: ''
                    },
                    run_at: '',
                    last_run_at: ''
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

            //
            // Observers
            //

            schedulerObserver: function() {
                this.get('scriptToRun').setProperties({
                    interval: {
                        every: '',
                        period: ''
                    },
                    crontab: {
                        minute: '',
                        hour: '',
                        day_of_week: '',
                        day_of_month: '',
                        month_of_year: ''
                    },
                    last_run_at: ''
                });
            }.observes('scriptToRun.scheduler')

        });
    }
);
