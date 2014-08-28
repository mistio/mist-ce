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

            config: {
                timeWindow: 10 * TIME_MAP.MINUTE,
                measurementStep: 10 * TIME_MAP.SECOND,
                pollingInterval: 10 * TIME_MAP.SECOND,
                measurementOffset: 60 * TIME_MAP.SECOND,
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
                    'pollingMethod': args.pollingMethod
                });
                //this.startPolling();
            },


            close: function () {
                this.stopPolling();
                this._clear();
            },


            startPolling: function () {
                this.set('isPolling', true);
                this._startPolling();
            },


            getStats: function (request, callback) {

            },


            stopPolling: function () {
                this.set('isPolling', false);
            },


            handleStatsResponse: function () {

            },


            pendingRequests: [],

            poll: function () {

            },

            singleRequest: function (args) {
                this.requestData(
                    this._generateRequests(args)
                );
            },


            _generateRequests: function (args) {

                var requests = [];
                var offset = this.config.measurementOffset;
                this.content.forEach(function (graph) {
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


            clearPendingRequests: function () {
                this.set('pendingRequests', []);
            },


            requestData: function (requests) {
                this.clearPendingRequests();
                requests.forEach(function (request) {
                    this.pendingRequests.push(request);
                    if (this.pollingMethod == 'XHR')
                        this._requestStatsFromXHR(request);
                    if (this.pollingMethod == 'Socket')
                        this._requestStatsFromSocket(request);
                }, this);
            },


            responseHandler: function (data) {
                if (this.pollingMethod == 'XHR')
                    this._requestStatsFromXHR(request);
                if (this.pollingMethod == 'Socket')
                    this._requestStatsFromSocket(request);
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
                    'isPolling': null,
                    'pollingMethod': null,
                });
            },



            _startPolling: function () {

                // Loop
                var that = this;

                function poll () {


                    function statsCallback (response) {

                        var datapoints;
                        if (that.pollingMethod == 'Socket');
                            //datapoints = responce.metrics[]
                        if (that.pollingMethod == 'XHR')


                        // If the request was successfull, feed the datasouces
                        // with the new data
                        if (success)
                            request.datasources.forEach(function (datasource) {
                                var newDatapoints = [];
                                response[datasource.metric.id].datapoints.forEach(function (datapoint) {
                                    if (datapoint[1] <= stop && datapoint[1] > start)
                                        newDatapoints.push(datapoint);
                                });
                                datasource.update(newDatapoints);
                            });

                        // Count down the remaining responses until zero,
                        // and then request new data
                        if (! --remainingResponses) {
                            that.content.forEach(function (graph) {
                                graph.view.draw();
                            });
                            setTimeout(poll, that.config.pollingInterval);
                        }
                    }
                }
            },


            _requestStatsFromXHR: function (request) {
                $.ajax({
                    url: request.url,
                    data: this._generateRequestData(request),
                    type: 'GET',
                    complete: this._handleStatsFromXHR
                });
            },


            _requestStatsFromSocket: function (request) {
                var data = this._generateRequestData(request);
                Mist.socket.emit('stats',
                    request.machine.backend.id,
                    request.machine.id,
                    request.metrics,
                    data.start,
                    data.stop,
                    data.step,
                    request.id
                );
            },


            _handleStatsFromXHR: function (jqXHR) {
                var that = Mist.graphsController;
                if (jqXHR.status == 200) {
                    that._handleStats(jqXHR.responseJSON);
                }
            },


            _handleStatsFromSocket: function (data) {
                this._handleStats(data);
            },


            _handleStats: function (data) {
                info('handling stats');
                var request = this.pendingRequests.findBy('id', parseInt(data.request_id));
                Mist.set('resp', data);
                info('request', request);
                if (request) {
                    request.datasources.forEach(function (datasource) {
                        var newDatapoints = [];
                        data[datasource.metric.id].datapoints.forEach(function (datapoint) {
                            if (datapoint[1] <= request.from - this.config.measurementOffset
                                && datapoint[1] - this.config.measurementOffset  > request.until)
                                newDatapoints.push(datapoint);
                        }, this);
                        datasource.update(newDatapoints);
                    }, this);
                    this.pendingRequests.removeObject(request);
                    if (!this.pendingRequests.length)
                        this.content.forEach(function (graph) {
                            graph.view.draw();
                        });
                }
            },


            _generateRequestData: function (request) {

                return {
                    v: 2,
                    request_id: request.id,
                    start: parseInt(request.from / 1000) - 50,
                    stop: parseInt(request.until / 1000) + 50,
                    step: parseInt(this.config.measurementStep / 1000),
                    metrics: request.metrics
                };
            }
        });
    }
);
