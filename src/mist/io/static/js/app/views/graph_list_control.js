define('app/views/graph_list_control', ['app/views/templated'],
    //
    //  Graph List Control View
    //
    //  @returns Class
    //
    function (TemplatedView) {

        'use strict';

        return App.GraphListControlView = TemplatedView.extend({


            //
            //
            //  Properties
            //
            //

            selectedTimeWindow: '',

            timeWindowText: function () {
                if (Mist.graphsController.stream.isStreaming)
                    return this.get('selectedTimeWindow') || 'last 10 mins';
                var from = Mist.graphsController.fetchStatsArgs.from;
                var until = Mist.graphsController.fetchStatsArgs.until;
                if (!from || !until)
                    return '';
                var thisYear = new Date().getFullYear();
                from = new Date(from).getPrettyDateTime(true, true);
                from = from.replace(', ' + thisYear, '');
                until = new Date(until).getPrettyDateTime(true, true);
                until = until.replace(', ' + thisYear, '');
                return from + ' - ' + until;
            }.property(
                'Mist.graphsController.config.fetchStatsArgs',
                'Mist.clock.second'
            ),


            //
            //
            //  Initialization
            //
            //


            load: function () {
                Ember.run.next(this, function () {
                    // Make sure element is rendered
                    this.$().trigger('create');
                });
            }.on('didInsertElement'),


            //
            //
            //  Pseudo-Private Methods
            //
            //

            _openRangeSelectionPopup: function () {
                Ember.run.later(this, function () {
                    $('#pick-range').popup('open');
                    var from = Mist.graphsController.fetchStatsArgs.from;
                    var until = Mist.graphsController.fetchStatsArgs.until;
                    $('#pick-range #range-start').val(new Date(from).toLocaleString());
                    $('#pick-range #range-stop').val(new Date(until).toLocaleString());
                }, 300);
            },


            _closeRangeSelectionPopup: function () {
                $('#pick-range').popup('close');
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                timeWindowClicked: function () {
                    $('#change-time-window').popup('open');
                },


                timeWindowChanged: function (newTimeWindow, title) {
                    $('#change-time-window').popup('close');
                    if (newTimeWindow == 'range') {
                        this._openRangeSelectionPopup();
                    } else {
                        Mist.graphsController.resolution.change(newTimeWindow);
                        this.set('selectedTimeWindow', title);
                    }
                },


                rangeOkClicked: function () {
                    var from = new Date($('#pick-range #range-start').val());
                    var until = new Date($('#pick-range #range-stop').val());
                    if (from == 'Invalid Date') {
                        Mist.notificationController.timeNotify('Invalid Date: "From"', 2000);
                        return;
                    }
                    if (until == 'Invalid Date') {
                        Mist.notificationController.timeNotify('Invalid Date: "To"', 2000);
                        return;
                    }
                    if (until <= from) {
                        Mist.notificationController.timeNotify('Invalid Range', 2000);
                        return;
                    }
                    var minRange = TIME_MAP.SECOND * 10 * DISPLAYED_DATAPOINTS;
                    if (until - from < minRange) {
                        Mist.notificationController.timeNotify('Range is too narrow.' +
                            ' Must be at least: ' + parseInt(minRange / TIME_MAP.MINUTE) +
                            ' mins.' , 3000);
                        return;
                    }
                    if (until.isFuture()) {
                        Mist.notificationController.timeNotify('Invalid Date: "To"', 2000);
                        return;
                    }
                    Mist.graphsController.history.change({
                        timeWindow: 'range',
                        from: from.getTime(),
                        until: until.getTime(),
                    });
                    this._closeRangeSelectionPopup();
                },


                rangeBackClicked: function () {
                    this._closeRangeSelectionPopup();
                },


                backClicked: function () {
                    Mist.graphsController.history.goBack();
                },


                forwardClicked: function () {
                    Mist.graphsController.history.goForward();
                }
            }
        });
    }
);
