define('app/views/log_list', ['app/views/page'],
    //
    //  Log List View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        var MIN_LOGS_DISPLAYED = 20;
        var MAX_LOGS_REQUESTED = 300;
        var LOGS_REQUEST_INTERVAL = 500;
        var EVENT_TYPES = ['job', 'shell', 'request', 'session', 'incident'];

        return App.LogListView = PageView.extend({


            //
            //
            //  Properties
            //
            //


            firstRequest: true,
            forceFlag: 'all',
            filterString: '',
            noMoreLogs: false,
            lastLogTimestamp: null,

            showErrors: null,

            includeTypes: [],
            includeFilters: [],
            includeEmails: [],

            excludeTypes: [],
            excludeFilters: [],
            excludeEmails: [],


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this._initializeController();
                this._initializeScrolling();
                this._initializeSocket();
                this._updateLogTime();
                this.set('firstRequest', true);
                this.search();
                Mist.l = this;
            }.on('didInsertElement'),


            unload: function () {
                this._initializeController();
                Mist.get('logs').off('logs', this, this.handleResponse);
                Mist.get('logs').off('event', this, this.handleStream);
            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            search: function () {

                if (!Mist.logs)  {
                    Ember.run.later(this, function () {
                        this.search();
                    }, 350);
                    return;
                }
                if (this.get('noMoreLogs'))
                    return;
                this.set('fetchingHistory', true);
                this._processFilterString();
                Mist.logs.emit('get_logs',  this._generatePayload());
                this.set('firstRequest', false);
            },


            handleResponse: function (logs) {
                if (logs.length)
                    this.set('lastLogTimestamp', logs[logs.length - 1].time);
                else
                    this.set('noMoreLogs', true);
                this.set('fetchingHistory', false);
                Ember.run(this, function () {
                    Mist.logsController._appendContent(
                        this.filter(logs)
                    );
                });
                if (logs.length && Mist.logsController.content.length < MIN_LOGS_DISPLAYED) {
                    this.set('disableScrollFetch', true);
                    Ember.run.later(this, function () {
                        this.search();
                    }, LOGS_REQUEST_INTERVAL);
                } else {
                    this.set('disableScrollFetch', false);
                }
            },


            handleStream: function (log) {
                Ember.run(this, function () {
                    Mist.logsController._prependContent(
                        this.filter([log])
                    )
                });
            },


            filter: function (logs) {

                logs = slice(logs);

                if (this.get('showErrors') != null)
                    this._filterErrors(logs, this.get('showErrors'));

                if (this.get('includeTypes').length)
                    this._filterInTypes(logs, this.get('includeTypes'));

                if (this.get('excludeTypes').length)
                    this._filterOutTypes(logs, this.get('excludeTypes'));

                if (this.get('includeEmails').length)
                    this._filterInEmails(logs, this.get('includeEmails'));

                if (this.get('excludeEmails').length)
                    this._filterOutEmails(logs, this.get('excludeEmails'));

                if (this.get('includeTerms').length)
                    this._filterInTerms(logs, this.get('includeTerms'));

                if (this.get('excludeTerms').length)
                    this._filterOutTerms(logs, this.get('excludeTerms'));

                var forceFlag = this.get('forceFlag');
                if (forceFlag != 'all') {
                    if (forceFlag == 'error')
                        this._filterErrors(logs, true);
                    else
                        this._filterInTypes(logs, [forceFlag]);
                }

                return logs;
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _initializeSocket: function () {
                if (!Mist.logs)  {
                    Ember.run.later(this, function () {
                        Mist.get('logs').on('logs', this, this.handleResponse);
                        Mist.get('logs').on('event', this, this.handleStream);
                    }, 350);
                } else {
                    Mist.get('logs').on('logs', this, this.handleResponse);
                    Mist.get('logs').on('event', this, this.handleStream);
                }
            },


            _initializeController: function () {
                Mist.logsController.clear();
            },


            _initializeScrolling: function () {
                var that = this;
                Ember.run.later(function () {
                    $(window).on('scroll', function (e) {
                        Ember.run.once(function () {
                            if (Mist.isScrolledToBottom() &&
                                !that.disableScrollFetch &&
                                !that.fetchingHistory) {
                                    that.search();
                            }
                        });
                    });
               }, 1000);
            },


            _processFilterString: function () {

                // Prepare filter
                var filter = this.get('filterString').trim().toLowerCase().split(' ').map(function (term) {
                    return term.trim();
                }).uniq().removeObject('');

                // Extract include terms
                var includeTerms = filter.filter(function (word) {
                    return word.charAt(0) !== '!';
                });
                filter = filter.removeObjects(includeTerms);

                // Extract exclude terms
                var excludeTerms = filter.map(function (word) {
                    return word.slice(1); // remove "!" char
                });

                // Extract include types
                var includeTypes = includeTerms.filter(function (term) {
                    return EVENT_TYPES.indexOf(term) > -1;
                }, this);
                includeTerms.removeObjects(includeTypes);

                // Extract exclude types
                var excludeTypes = excludeTerms.filter(function (term) {
                    return EVENT_TYPES.indexOf(term) > -1;
                }, this);
                excludeTerms.removeObjects(excludeTypes);

                // Extract include emails
                var includeEmails = includeTerms.filter(function (term) {
                    var result = term.match(EMAIL_REGEX);
                    return result ? result[0] : false;
                });
                includeTerms.removeObjects(includeEmails);

                // Extract exclude emails
                var excludeEmails = excludeTerms.filter(function (term) {
                    var result = term.match(EMAIL_REGEX);
                    return result ? result[0] : false;
                });
                excludeTerms.removeObjects(excludeEmails);

                // Show Errors
                var showErrors = null;
                if (includeTerms.indexOf('error') > -1) {
                    showErrors = true;
                    includeTerms.removeObject('error');
                }
                if (excludeTerms.indexOf('error') > -1) {
                    showErrors =  false;
                    excludeTerms.removeObject('error');
                }

                this.setProperties({
                    showErrors: showErrors,
                    includeTerms: includeTerms,
                    excludeTerms: excludeTerms,
                    includeTypes: includeTypes,
                    excludeTypes: excludeTypes,
                    includeEmails: includeEmails,
                    excludeEmails: excludeEmails,
                });
            },


            _updateLogTime: function () {
                if (this.$()) {
                    Ember.run(this, function () {
                        Mist.logsController.content.forEach(function (log) {
                            log.propertyWillChange('time');
                            log.propertyDidChange('time');
                        });
                    });
                    Ember.run.later(this, this._updateLogTime, 10 * TIME_MAP.SECOND);
                }
            },


            _generatePayload: function () {

                var limit = this.get('firstRequest') ? MIN_LOGS_DISPLAYED :
                    MAX_LOGS_REQUESTED;

                var payload = {limit: limit};

                if (this.get('showErrors') != null)
                    payload.error = this.get('showErrors');

                if (this.get('includeTypes').length == 1 &&
                    !this.get('excludeTypes').length)
                        payload.event_type = this.get('includeTypes')[0];

                if (this.get('includeEmails').length == 1 &&
                    !this.get('excludeEmails').length)
                        payload.email = this.get('includeEmails')[0];

                if (this.get('lastLogTimestamp'))
                    payload.stop = this.get('lastLogTimestamp');

                var forceFlag = this.get('forceFlag');
                if (forceFlag != 'all') {
                    if (forceFlag == 'error')
                        payload.error = true;
                    else
                        payload.event_type = forceFlag;
                }

                if (DEBUG_LOGS) {
                    info('Requesting logs:', payload)
                }

                this._injectExtraParams(payload);

                return payload;
            },


            _injectExtraParams: function (payload) {
                var extraParams = this.get('extraParams');
                if (!extraParams)
                    return;
                forIn(extraParams, function (value, name) {
                    payload[name] = extraParams.get(name);
                });
            },


            _filterErrors: function (logs, showErrors) {
                logs.removeObjects(
                    logs.rejectBy('error', showErrors)
                );
            },


            _filterInTypes: function (logs, types) {
                logs.removeObjects(
                    logs.filter(function (log) {
                        return types.indexOf(log.type) == -1;
                    })
                );
            },


            _filterOutTypes: function (logs, types) {
                types.forEach(function (type) {
                    logs.removeObjects(
                        logs.filterBy('type', type)
                    );
                });
            },


            _filterInEmails: function (logs, emails) {
                logs.removeObjects(
                    logs.filter(function (log) {
                        return emails.indexOf(log.email) == -1;
                    })
                );
            },


            _filterOutEmails: function (logs, emails) {
                emails.forEach(function (email) {
                    logs.removeObjects(
                        logs.filterBy('email', email)
                    );
                });
            },


            _filterInTerms: function (logs, terms) {
                logs.removeObjects(
                    logs.filter(function (log) {
                        return terms.some(function (term) {
                            return !forIn(log, function (value) {
                                return textInString(term, value);
                            })
                        })
                    })
                );
            },


            _filterOutTerms: function (logs, terms) {
                logs.removeObjects(
                    logs.filter(function (log) {
                        return terms.some(function (term) {
                            return forIn(log, function (value) {
                                return textInString(term, value);
                            });
                        })
                    })
                );
            },


            actions: {

                updateFilterFlags: function (flag) {
                    var newFilterString = this.get('filterString');
                    var flags = slice(EVENT_TYPES);
                    flags.push('error');
                    flags.forEach(function (f) {
                        newFilterString = newFilterString.replace('!'+f, '').replace(f, '');
                    });
                    this.set('filterString', newFilterString.trim().replace(/\s\s/g, ' '));
                    this.set('forceFlag', flag);
                    this.newSearch(1);
                }
            },


            newSearch: function (interval) {
               var that = this;
               clearTimeout(this.searchLock);
               this.set('searchLock', setTimeout(function () {
                   Mist.logsController.clear();
                   that.set('noMoreLogs', false);
                   that.set('lastLogTimestamp', null);
                   that.search();
               }, interval || 700))
           },


            //
            //
            //  Observers
            //
            //


            filterStringObserver: function () {
                Ember.run.once(this, 'newSearch');
            }.observes('filterString')
        });


        function textInString (text, str) {
            if (typeof str != 'string')
                return false;
            return str.toLowerCase().indexOf(text) > -1;
        }
    }
);
