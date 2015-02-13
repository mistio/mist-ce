define('app/controllers/graphs', ['app/models/stats_request', 'ember'],
    //
    //  Graphs Controller
    //
    //  @returns Class
    //
    function (StatsRequest) {

        'use strict';

        var TIME_WINDOW_MAP = {
            minutes: 10 * TIME_MAP.MINUTE,
            hour: TIME_MAP.HOUR,
            day: TIME_MAP.DAY,
            week: TIME_MAP.WEEK,
            month: TIME_MAP.MONTH,
        };

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            isOpen: null,
            content: [],
            resizeLock: null,
            pendingRequests: [],
            fetchingStats: null,
            fetchingStatsArgs: null,
            config: Ember.Object.create({
                requestMethod: 'Socket',
                timeWindow: TIME_WINDOW_MAP.minutes,
                measurementStep: 10 * TIME_MAP.SECOND,
                measurementOffset: 60 * TIME_MAP.SECOND,

                canModify: true,
                canControl: true,
                canMinimize: true,
                showGraphLegend: false,
                historyWidgetPosition: 'top',
            }),


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.stream.set('parent', this);
                this.history.set('parent', this);
                this.resolution.set('parent', this);
            },


            //
            //
            //  Methods
            //
            //


            open: function (args) {

                this._clear();

                this.setProperties({
                    'isOpen': true,
                    'content': args.graphs,
                });

                forIn(this, args.config, function (value, property) {
                    this.config.set(property, value);
                });

                Ember.run.next(this, function () {
                    this.stream.start();
                });

                if (args.config.timeWindow)
                    this.resolution.change(args.config.timeWindow, true);

                $(window).on('resize', this._handleWindowResize);
            },


            close: function () {
                this.stream.stop();
                this._clear();
                $(window).off('resize', this._handleWindowResize);
            },


            getGraph: function(id) {
                return this.content.findBy('id', id);
            },


            graphExists: function (id) {
                return !!this.getGraph(id);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    'isOpen': false,
                    'content': [],
                });
                this.get('config').setProperties({
                    canModify: true,
                    canControl: true,
                    canMinimize: true,
                    timeWindow: TIME_WINDOW_MAP.minutes,
                    showGraphLegend: false,
                    historyWidgetPosition: 'top',
                });
                this._clearPendingRequests();
            },


            _fetchStats: function (args) {

                if (!this.get('isOpen')) return;

                if (DEBUG_STATS) {
                    info('Requesting stats from: ' +
                        new Date(args.from).getPrettyDateTime() +
                        ' until: ' +
                        new Date(args.until).getPrettyDateTime());
                }

                this._clearPendingRequests();
                this.setProperties({
                    fetchingStats: true,
                    fetchStatsArgs: args
                });

                var requests = this._generateRequests(args);
                requests.forEach(function (request) {
                    this.pendingRequests.push(request);
                    if (this.config.requestMethod == 'XHR')
                        this._fetchStatsFromXHR(request);
                    if (this.config.requestMethod == 'Socket')
                        this._fetchStatsFromSocket(request);
                }, this);
            },


            _clearPendingRequests: function () {
                this.set('pendingRequests', []);
                this.set('fetchingStats', false);
            },


            _generateRequests: function (args) {

                var requests = [];
                var offset = this.config.measurementOffset;
                this.get('content').forEach(function (graph) {
                    graph.datasources.forEach(function (datasource) {
                        var newRequest = StatsRequest.create({
                            from: args.from - offset,
                            until: args.until - offset,
                            datasources: [datasource],
                        });
                        // Try to merge this request with another
                        // one to reduce API calls
                        var didMerge = false;
                        requests.some(function (request) {
                            if (request.canMerge(newRequest)) {
                                request.merge(newRequest);
                                return didMerge = true;
                            }
                        });
                        if (!didMerge)
                            requests.push(newRequest);
                    });
                });
                return requests;
            },


            _fetchStatsFromXHR: function (request) {
                $.ajax({
                    type: 'GET',
                    url: request.url,
                    data: this._generatePayload(request),
                    complete: this._handleXHRResponse
                });
            },


            _fetchStatsFromSocket: function (request) {
                var data = this._generatePayload(request);
                var machine = request.datasources[0].machine;
                Mist.socket.emit('stats',
                    machine.backend.id,
                    machine.id,
                    data.start,
                    data.stop,
                    data.step,
                    request.id,
                    request.metrics
                );
            },


            _generatePayload: function (request) {
                return {
                    request_id: request.id,
                    start: parseInt(request.from / 1000) - 50,
                    stop: parseInt(request.until / 1000) + 50,
                    step: parseInt(this.config.measurementStep / 1000),
                    metrics: request.metrics
                };
            },


            _handleXHRResponse: function (jqXHR) {
                var that = Mist.graphsController;
                if (jqXHR.status == 200) {
                    var response = jqXHR.responseJSON;
                    var request = that.pendingRequests.findBy(
                        'id', parseInt(response.request_id));
                    if (request)
                        that._handleResponse(request, response);
                } else {
                    Ember.run.later(function () {
                        that._fetchStats(that.fetchStatsArgs);
                    }, that.config.measurementStep / 2);
                }
            },


            _handleSocketResponse: function (data) {
                var that = Mist.graphsController;
                var request = that.pendingRequests.findBy(
                    'id', parseInt(data.request_id));
                if (request)
                    that._handleResponse(request, data.metrics);
                that.trigger('onFetchStatsFromSocket', data);
            },


            _handleResponse: function (request, response) {

                request.datasources.forEach(function (datasource) {

                    if (!response[datasource.metric.id]) return;

                    var datapoints = this._processedDatapoints(request,
                        response[datasource.metric.id].datapoints);

                    if (this.stream.isStreaming)
                        datasource.update(datapoints);
                    else
                        datasource.overwrite(datapoints);

                }, this);

                var hadRequests = this.pendingRequests.length;
                this.pendingRequests.removeObject(request);

                if (!this.pendingRequests.length && hadRequests)
                    this._fetchStatsEnded(response);
            },


            _processedDatapoints: function (request, datapoints) {
                var newDatapoints = [];
                datapoints.forEach(function (datapoint) {
                    if (datapoint[1] >= parseInt(request.from / 1000) &&
                        datapoint[1] <= parseInt(request.until / 1000))
                            newDatapoints.push(datapoint);
                }, this);
                return newDatapoints;
            },


            _fetchStatsEnded: function (response) {
                Ember.run.next(this, function () {
                    this.get('content').forEach(function (graph) {
                        graph.view.draw();
                    });
                    this.set('fetchingStats', false);
                    if (this.fetchStatsArgs.callback instanceof Function)
                        this.fetchStatsArgs.callback();
                    this.trigger('onFetchStats', response);
                });
            },


            _restoreFetchStatsArgs: function () {

                // Restores fetch stats args to match currently
                // displayed datapoints. Used after closing a streaming
                // session.

                if (!this.get('content').length) return;
                var datasource = this.get('content')[0].datasources[0];

                this.set('fetchStatsArgs', {
                    from: datasource.getFirstTimestamp() || (Date.now() - this.config.timeWindow),
                    until: datasource.getLastTimestamp() || Date.now(),
                });
            },


            _handleWindowResize: function () {

                var that = Mist.graphsController;
                clearTimeout(that.resizeLock);
                that.set('resizeLock', setTimeout(resize, 500));
                function resize () {
                    that.content.forEach(function (graph) {
                        graph.view.autoResize();
                    });
                }
            },


            //
            //
            //  Resolution Object
            //
            //


            resolution: Ember.Object.create({


                //
                //
                //  Properties
                //
                //


                parent: null,


                //
                //
                //  Methods
                //
                //


                change: function (newTimeWindow, forceChange) {

                    var newTimeWindow = TIME_WINDOW_MAP[newTimeWindow];
                    var oldTimeWindow = this.parent.config.timeWindow;

                    if ((oldTimeWindow != newTimeWindow)|| forceChange) {

                        this.parent.stream.stop();
                        this.parent.config.setProperties({
                            timeWindow: newTimeWindow,
                            measurementStep: newTimeWindow /
                                DISPLAYED_DATAPOINTS,
                        });

                        if (forceChange) {
                            this.parent.stream.start();
                            return;
                        }

                        // Calculate new time boundaries
                        var oldFrom = this.parent.fetchStatsArgs.from;
                        var oldUntil = this.parent.fetchStatsArgs.until;

                        var middle = oldFrom + ((oldUntil - oldFrom) / 2);

                        var newFrom = middle - (newTimeWindow / 2);
                        var newUntil = middle + (newTimeWindow / 2);

                        if (this.parent.history.isInFuture(newUntil))
                            this.parent.stream.start();
                        else
                            this.parent._fetchStats({
                                from: newFrom,
                                until: newUntil,
                            });
                    }
                }
            }),


            //
            //
            //  History Object
            //
            //


            history: Ember.Object.create({


                //
                //
                //  Properties
                //
                //


                parent: null,


                //
                //
                //  Methods
                //
                //


                goBack: function () {
                    this.parent._clearPendingRequests();
                    this.parent.stream.stop();
                    this.parent._fetchStats({
                        from: this.parent.fetchStatsArgs.from -
                            this.parent.config.timeWindow,
                        until: this.parent.fetchStatsArgs.from
                    });
                },


                goForward: function () {
                    this.parent._clearPendingRequests();
                    if (this.isInFuture(this.parent.fetchStatsArgs.until))
                        this.parent.stream.start();
                    else
                        this.parent._fetchStats({
                            from: this.parent.fetchStatsArgs.until,
                            until: this.parent.fetchStatsArgs.until +
                                this.parent.config.timeWindow
                        });
                },


                isInFuture: function (until) {
                    return Date.now() <= until;
                },
            }),


            //
            //
            //  Streaming Object
            //
            //


            stream: Ember.Object.create({


                //
                //
                //  Properties
                //
                //


                parent: null,
                isStreaming: null,
                currentSessionId: 0,
                timeOfLastRequest: null,
                firstStreamingCall: null,


                //
                //
                //  Methods
                //
                //


                start: function () {
                    if (!this.isStreaming) {
                        this.parent._clearPendingRequests();
                        this.set('isStreaming', true);
                        this._stream(this.currentSessionId, true);
                    }
                },


                stop: function () {
                    if (this.isStreaming) {
                        this.parent._clearPendingRequests();
                        this.parent._restoreFetchStatsArgs();
                        this.setProperties({
                            isStreaming: false,
                            firstStreamingCall: false,
                            currentSessionId: this.currentSessionId + 1,
                        });
                    }
                },


                //
                //
                //  Pseudo-Private Methods
                //
                //


                _stream: function (sessionId, firstTime) {

                    if (this._sessionIsAlive(sessionId)) {

                        var now = Date.now();

                        // If this is the first time requesting stats for streaming
                        // we need to get enough stats to fill the entire graph
                        //
                        // Else, we request stats from where the previous request
                        // left off
                        var from = firstTime ?
                            now - this.parent.config.timeWindow :
                            this.timeOfLastRequest

                        this.parent._fetchStats({
                            from: from,
                            until: now,
                            callback: callback
                        });

                        if (firstTime)
                            this.set('firstStreamingCall', true);
                        this.set('timeOfLastRequest', now);
                    }

                    var that = this;
                    function callback () {
                        that.set('firstStreamingCall', false);
                        Ember.run.later(function () {
                            that._stream(sessionId);
                        }, that._getNextRequestDelay());
                    }
                },


                _getNextRequestDelay: function () {

                    // Client should make new stats requests every
                    // <measurementStep> milliseconds.
                    //
                    // We subtract the time elapsed on the previous
                    // request from the interval to make sure
                    // the next request is made on time.

                    return this.parent.config.measurementStep -
                        (Date.now() - this.timeOfLastRequest);
                },


                _sessionIsAlive: function (sessionId) {
                    return this.currentSessionId == sessionId;
                },
            }),
        });
    }
);
