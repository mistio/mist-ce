define('app/views/log_list', ['app/views/mistscreen'],
    //
    //  Promo List View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return PageView.extend({


            //
            //
            //  Properties
            //
            //


            isPolling: false,
            socket: null,
            filterValue: null,
            genericTextFilter: null,

            lastLogTime: null,
            firstLogTime: null,

            searchJobs: null,
            searchShell: null,
            searchErrors: null,
            searchRequests: null,
            searchSessions: null,
            searchIncidents: null,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                var that = this;
                this.set('socket', Socket_({
                    namespace: '/logs',
                    keepAlive: false,
                    onConnect: function () {
                        that.set('filterValue', that.get('filterValue') || '');
                        that.set('isPolling', true);
                    },
                    onInit: function (socket) {
                        socket.on('logs', function (logs) {
                            that.handleSocketResponse(logs);
                        });
                    },
                }));

                Ember.run.later(function () {
                    $(window).on('scroll', function (e) {
                        that.set('pageYOffset', window.pageYOffset);
                    });
                }, 1000);

                this.updateLogTime();
                Mist.logsController._setContent([]);
            }.on('didInsertElement'),


            unload: function () {
                this.get('socket').kill();
                $(window).off('scroll');
                Mist.logsController._setContent([]);
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            setLogTimeRange: function (newLogs) {

                var firstLogTime = 0;
                var lastLogTime = Date.now();
                var logsContent = Mist.logsController.content;
                if (logsContent.length) {
                    firstLogTime = logsContent[0].time;
                    lastLogTime = logsContent[logsContent.length - 1].time;
                }
                if (newLogs.length) {
                    if (firstLogTime < newLogs[0].time)
                        firstLogTime = newLogs[0].time;
                    if (lastLogTime > newLogs[newLogs.length - 1].time)
                        lastLogTime = newLogs[newLogs.length - 1].time;
                }
                this.setProperties({
                    firstLogTime: firstLogTime,
                    lastLogTime: lastLogTime,
                });
            },


            updateLogTime: function () {
                if (this.$()) {
                    Ember.run(this, function () {
                        Mist.logsController.content.forEach(function (log) {
                            log.propertyWillChange('time');
                            log.propertyDidChange('time');
                        });
                    });
                    Ember.run.later(this, this.updateLogTime, 10 * TIME_MAP.SECOND);
                }
            },


            handleSocketResponse: function (logs) {

                Ember.run(this, function () {

                    this.setLogTimeRange(logs);

                    this.set('searching', false);

                    if (this.get('payload').start !== null)
                        logs.removeObjects(logs.filterBy('time', this.get('payload').start));
                    if (this.genericTextFilter.length) {
                        logs = logs.filter(function (log) {
                            return this.genericTextFilter.every(function (filter) {
                                var keepLog = false;
                                forIn(this, log, function (value) {
                                    if (typeof value == 'string')
                                        if (value.toLowerCase().indexOf(filter) > -1)
                                            keepLog = true;
                                });
                                return keepLog;
                            });
                        }, this);

                        // Filter rejected terms
                        var rejectedLogs = logs.filter(function (log) {
                            return this.rejectTerms.any(function (filter) {
                                var rejectLog = false;
                                forIn(this, log, function (value) {
                                    if (typeof value == 'string')
                                        if (value.toLowerCase().indexOf(filter) > -1)
                                            rejectLog = true;
                                });
                                return rejectLog;
                            });
                        }, this);
                        logs.removeObjects(rejectedLogs);
                    }
                    if (this.get('fetchingHistory')) {
                        Mist.logsController._appendContent(logs);
                        this.set('fetchingHistory', false);
                    } else {
                        info('calling prepend')
                        Mist.logsController._prependContent(logs);
                    }
                    return;
                    if (Mist.logsController.content.length < 30)
                        Ember.run.later(this, function () {
                            info('fetching more logs due to few results')
                            this.fetchHistory(200);
                        }, 500);
                });
            },


            search: function () {

                var terms = this.get('filterValue').trim().toLowerCase().split(' ');

                var rejectTerms = terms.filter(function (term) {
                    return term.charAt(0) == '!';
                });
                terms.removeObjects(rejectTerms);
                rejectTerms = rejectTerms.map(function (term) {
                    return term.slice(1);
                });

                // Generate payload
                var payload = {};
                if (terms.indexOf('error') > -1 || this.get('searchErrors')) {
                    payload.error = true;
                    terms.removeObject('error');
                }
                if (terms.indexOf('job') > -1 || this.get('searchJobs')) {
                    payload.event_type = 'job';
                    terms.removeObject('job');
                }
                if (terms.indexOf('request') > -1 || this.get('searchRequests')) {
                    payload.event_type = 'request';
                    terms.removeObject('request');
                }
                if (terms.indexOf('incident') > -1 || this.get('searchIncidents')) {
                    payload.event_type = 'incident';
                    terms.removeObject('incident');
                }
                if (terms.indexOf('session') > -1 || this.get('searchSessions')) {
                    payload.event_type = 'session';
                    terms.removeObject('session');
                }
                if (terms.indexOf('shell') > -1 || this.get('searchShell')) {
                    payload.event_type = 'shell';
                    terms.removeObject('shell');
                }

                payload.email = Mist.email;

                Mist.logsController._setContent([]);
                this.set('searching', true);
                this.set('payload', payload)
                this.set('genericTextFilter', terms);
                this.set('rejectTerms', rejectTerms);
                this.get('socket').emit('get_logs', payload);
            },


            windowScrolled: function () {
                if (Mist.isScrolledToTop())
                    this.continuePoll();
                else {
                    this.set('isPolling', false);
                    if (Mist.isScrolledToBottom())
                        this.fetchHistory();
                }
            },


            continuePoll: function () {
                if (this.get('isPolling'))
                    return;
                this.set('isPolling', true);
                var payload = this.get('payload');
                payload.start = this.get('firstLogTime');
                delete payload.stop;
                this.get('socket').emit('get_logs', payload);
            },


            fetchHistory: function (limit) {
                if (this.get('fetchingHistory'))
                    return;
                this.set('fetchingHistory', true);
                var payload = this.get('payload');
                delete payload.start;
                if (limit) payload.limit = limit;
                payload.stop = this.get('lastLogTime');
                this.get('socket').emit('get_logs', this.get('payload'))
            },


            //
            //
            //  Actions
            //
            //


            actions: {

                updateFilterFlags: function () {
                    var all = $('#event-all').is(":checked");
                    var error = $('#event-error').is(":checked");
                    this.setProperties({
                        searchJobs: all || error ? false : $('#event-jobs').is(":checked"),
                        searchShell: all || error ? false : $('#event-shell').is(":checked"),
                        searchRequests: all || error ? false : $('#event-requests').is(":checked"),
                        searchSessions: all || error ? false : $('#event-sessions').is(":checked"),
                        searchIncidents: all || error ? false : $('#event-incidents').is(":checked"),
                        searchErrors: error,
                    });
                },
            },


            //
            //
            //  Observers
            //
            //


            filterValueObserver: function () {

                var that = this;
                clearTimeout(this.filterLock);
                this.set('filterLock', setTimeout(function () {
                    that.search();
                }, 1000));
            }.observes('filterValue',
                'searchJobs',
                'searchRequests',
                'searchIncidents',
                'searchErrors',
                'searchShell',
                'searchSessions'),


            scrollObserver: function () {
                Ember.run.once(this, 'windowScrolled');
            }.observes('pageYOffset')
        });
    }
);
