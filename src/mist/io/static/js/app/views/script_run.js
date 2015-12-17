define('app/views/script_run', ['app/views/popup'],
    //
    //  Script Run View
    //
    //  @returns Class
    function (PopupComponent) {

        'use strict';

        return App.ScriptRunComponent = PopupComponent.extend({

            layoutName: 'script_run',
            controllerName: 'scriptRunController',
            popupId: '#script-run',

            scriptSchedulers: [{
                label: 'One-Off',
                value: 'one_off',
            }, {
                label: 'Interval',
                value: 'interval'
            }, {
                label: 'Crontab',
                value: 'crontab'
            }],

            scriptPeriods: [{
                label: 'seconds',
                limit: 60,
            }, {
                label: 'minutes',
                limit: 60
            }, {
                label: 'hours',
                limit: 24
            }, {
                label: 'days',
                limit: 30
            }],
            scriptEveryOptions: [],
            scheduleRun: false,

            isReady: function () {
                return Mist.scriptRunController.scriptToRun.machine.id;
            }.property('Mist.scriptRunController.scriptToRun.machine'),

            isOneOff: function() {
                return Mist.scriptRunController.scriptToRun.scheduler.value == 'one_off';
            }.property('Mist.scriptRunController.scriptToRun.scheduler'),

            isInterval: function() {
                return Mist.scriptRunController.scriptToRun.scheduler.value == 'interval';
            }.property('Mist.scriptRunController.scriptToRun.scheduler'),

            isCron: function() {
                return Mist.scriptRunController.scriptToRun.scheduler.value == 'crontab';
            }.property('Mist.scriptRunController.scriptToRun.scheduler'),

            crontabMinutes: Ember.computed(function() {
                return ['Every minute'].concat(this._setOptions(59, 0));
            }),

            crontabHours: Ember.computed(function() {
                return ['Every hour'].concat(this._setOptions(23, 0));
            }),

            crontabDaysOfWeek: Ember.computed(function() {
                return ['Every dat'].concat(this._setOptions(7, 0));
            }),

            crontabDaysOfMonth: Ember.computed(function() {
                return ['Every day'].concat(this._setOptions(31, 1));
            }),

            crontabMonthsOfYear: Ember.computed(function() {
                return ['Every month'].concat(this._setOptions(12, 1));
            }),

            hasExpire: Ember.computed('isInterval', 'isCron', function() {
                return this.get('isInterval') || this.get('isCron');
            }),

            //
            // Methods
            //

            _renderFields: function() {
                Ember.run.schedule('afterRender', this, function() {
                    $('body').enhanceWithin();
                });
            },

            _closeDropdown: function(el) {
                $('#script-run-' + el + ' .mist-select').collapsible('collapse');
            },

            _setOptions: function(end, start, step) {
                var start = start || 0,
                    step = step || 1,
                    result = [],
                    item = start;

                while (item <= end) {
                    result.push(item);
                    item += step;
                }

                return result;
            },

            _selectScheduler: function(scheduler) {
                this._closeDropdown('scheduler');
                Mist.scriptRunController.get('scriptToRun').set('scheduler', scheduler);
                this._renderFields();
            },

            _selectIntervalPeriod: function(period) {
                this._closeDropdown('interval-period');
                Mist.scriptRunController.setProperties({
                    'scriptToRun.interval.period': period,
                    'scriptToRun.interval.every': 1
                });
                this.set('scriptEveryOptions', this._setOptions(period.limit, 1));
                this._renderFields();
            },

            _selectIntervalEvery: function(every) {
                this._closeDropdown('interval-every');
                Mist.scriptRunController.get('scriptToRun').set('interval.every', every);
                this._renderFields();
            },

            _selectCrontabMinute: function(minute) {
                this._closeDropdown('crontab-minute');
                Mist.scriptRunController.get('scriptToRun').set('crontab.minute', minute);
            },

            _selectCrontabHour: function(hour) {
                this._closeDropdown('crontab-hour');
                Mist.scriptRunController.get('scriptToRun').set('crontab.hour', hour);
            },

            _selectCrontabDayOfWeek: function(day) {
                this._closeDropdown('crontab-day-of-week');
                Mist.scriptRunController.get('scriptToRun').set('crontab.day_of_week', day);
            },

            _selectCrontabDayOfMonth: function(day) {
                this._closeDropdown('crontab-day-of-month');
                Mist.scriptRunController.get('scriptToRun').set('crontab.day_of_month', day);
            },

            _selectCrontabMonthOfYear: function(month) {
                this._closeDropdown('crontab-month-of-year');
                Mist.scriptRunController.get('scriptToRun').set('crontab.month_of_year', month);
            },

            //
            //  Actions
            //

            actions: {
                machineClicked: function (machine) {
                    Mist.scriptRunController.get('scriptToRun').set('machine', machine);
                    $('#script-run-machine').collapsible('collapse');
                },

                backClicked: function () {
                    Mist.scriptRunController.close();
                },

                runClicked: function () {
                    Mist.scriptRunController.run();
                },

                switchScheduleRun: function() {
                    var val = $('#script-run-type select').val();
                    console.log(val);
                    this.set('scheduleRun', val == 1);
                    Mist.scriptRunController.get('scriptToRun').set('scheduler', '');
                    this._renderFields();
                },

                selectScheduler: function(scheduler) {
                    this._selectScheduler(scheduler);
                },

                selectIntervalPeriod: function(period) {
                    this._selectIntervalPeriod(period);
                },

                selectIntervalEvery: function(every) {
                    this._selectIntervalEvery(every);
                },

                selectCrontabMinute: function(minute) {
                    this._selectCrontabMinute(minute);
                },

                selectCrontabHour: function(hour) {
                    this._selectCrontabHour(hour);
                },

                selectCrontabDayOfWeek: function(day) {
                    this._selectCrontabDayOfWeek(day);
                },

                selectCrontabDayOfMonth: function(day) {
                    this._selectCrontabDayOfMonth(day);
                },

                selectCrontabMonthOfYear: function(day) {
                    this._selectCrontabMonthOfYear(day);
                }
            }
        });
    }
);
