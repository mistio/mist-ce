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
                label: 'Now',
                value: 'now'
            }, {
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

            _setEveryOptions: function(end, start, step) {
                var start = start || 0,
                    step = step || 1,
                    result = [],
                    item = start;

                while (item <= end) {
                    result.push(item);
                    item += step;
                }

                this.set('scriptEveryOptions', result);
            },

            _selectScheduler: function(scheduler) {
                console.log(scheduler);
                this._closeDropdown('scheduler');
                Mist.scriptRunController.get('scriptToRun').set('scheduler', scheduler);
                this._renderFields();
            },

            _selectPeriod: function(period) {
                this._closeDropdown('period');
                Mist.scriptRunController.setProperties({
                    'scriptToRun.interval.period': period,
                    'scriptToRun.interval.every': 1
                });
                this._setEveryOptions(period.limit, 1);
                this._renderFields();
            },

            _selectEvery: function(every) {
                this._closeDropdown('every');
                Mist.scriptRunController.get('scriptToRun').set('interval.every', every);
                this._renderFields();
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

                selectScheduler: function(scheduler) {
                    this._selectScheduler(scheduler);
                },

                selectPeriod: function(period) {
                    this._selectPeriod(period);
                },

                selectEvery: function(every) {
                    this._selectEvery(every);
                }
            }
        });
    }
);
