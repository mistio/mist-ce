define('app/controllers/graphs', ['app/models/stats_request', 'ember'],
    //
    //  Graphs Controller
    //
    //  @returns Class
    //
    function (StatsRequest) {

        'use strict';

        return Ember.ArrayController.extend({


            //
            //
            //  Properties
            //
            //


            isOpen: null,
            content: null,
            isPolling: null,
            pollingMethod: null,
            pendingRequests: [],

            config: {
                requestMethod: 'XHR',
                timeWindow: 10 * TIME_MAP.MINUTE,
                measurementStep: 10 * TIME_MAP.SECOND,
                pollingInterval: 10 * TIME_MAP.SECOND,
                measurementOffset: 40 * TIME_MAP.SECOND,
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
                this.stream();
            },


            close: function () {
                this.stopStreaming();
                this._clear();
            },


            stream: function () {
                this.set('isStreamming', true);
                this._fetchStats({
                    from: Date.now() - this.config.timeWindow,
                    until: Date.now()
                });
            },


            stopStreaming: function () {
                this.set('isStreamming', false);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _clear: function () {
                this.setProperties({
                    'isOpen': null,
                    'content': null,
                    'isStreamming': null,
                });
            },



            _fetchStats: function (args) {

                if (this.isClosed) return;

                this.set('fetchStatsArgs', args);
                this.set('pendingRequests', []);

                var requests = this._generateRequests(args);
                requests.forEach(function (request) {
                    this.pendingRequests.push(request);
                    if (this.config.requestMethod == 'XHR')
                        this._fetchStatsFromXHR(request);
                    if (this.config.requestMethod == 'Socket')
                        this._fetchStatsFromSocket(request);
                }, this);
            },


            _generateRequests: function (args) {

                var now = Date.now();
                var requests = [];
                var offset = this.config.measurementOffset;
                this.content.forEach(function (graph) {
                    graph.datasources.forEach(function (datasource) {
                        var newRequest = StatsRequest.create({
                            from: (args ? args.from : datasource.getLastTimestamp()) - offset,
                            until: (args ? args.until : now) - offset,
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
                    v: 2,
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
                    }, that.config.pollingInterval / 2);
                }
            },


            _handleSocketResponse: function (data) {
                var that = Mist.graphsController;
                var request = that.pendingRequests.findBy(
                    'id', parseInt(data.request_id));
                if (request)
                    that._handleResponse(request, data.metrics);
            },


            _handleResponse: function (request, response) {

                var processedDatapoints =
                request.datasources.forEach(function (datasource) {

                    var datapoints = this._processedDatapoints(request,
                        response[datasource.metric.id].datapoints);

                    datasource.update(datapoints);

                }, this);

                this.pendingRequests.removeObject(request);

                if (!this.pendingRequests.length)
                    this._fetchStatsEnded();
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


            _fetchStatsEnded: function () {
                this.content.forEach(function (graph) {
                    graph.view.draw();
                });
                Ember.run.later(this, function () {
                    if (this.isStreamming)
                        this._fetchStats();
                }, this.config.pollingInterval);
            }
        });
    }
);
