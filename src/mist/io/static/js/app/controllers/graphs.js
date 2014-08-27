define('app/controllers/graphs', ['ember'],
    //
    //  Graphs Controller
    //
    //  @returns Class
    //
    function () {

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
                this.startPolling();
            },


            close: function () {
                this.stopPolling();
                this._clear();
            },


            startPolling: function () {
                this.set('isPolling', true);
                this._startPolling();
            },


            stopPolling: function () {
                this.set('isPolling', false);
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

                    var requests = that._mergeStatsRequests(
                        that._gotherStatsRequests()
                    );

                    var remainingResponses = Object.keys(requests).length;

                    forIn(requests, function (request) {
                        if (that.pollingMethod == 'Socket')
                            that._requestStatsFromSocket(request, statsCallback);
                        if (that.pollingMethod == 'XHR')
                            that._requestStatsFromXHR(request, statsCallback);
                    });


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


            _requestStatsFromXHR: function (request, callback) {
                var data = this._generateRequestData(request);
                $.ajax({
                    url: request.url,
                    data: data,
                    type: 'GET',
                    complete: callback,
                });
            },


            _requestStatsFromSocket: function (request, callback) {
                var data = this._generateRequestData(request);
                Mist.socket.statsCallback = callback;
                Mist.socket.emit('stats',
                    request.machine.backend.id,
                    request.machine.id,
                    request.metrics,
                    data.start,
                    data.stop,
                    data.step,
                );
            },


            _generateRequestData: function (request) {

                var step = this.config.measurementStep / 1000;
                var stop = (Date.now() - this.config.measurementOffset) / 1000;
                var start = (request.start - this.config.measurementOffset) / 1000;

                return {
                    v: 2,
                    step: parseInt(step),
                    stop:  parseInt(stop) + 50,
                    start: parseInt(start) - 50,
                    metrics: request.metrics
                };
            },


            _preprocessStatsResponse: function (response) {

            },


            _gotherStatsRequests: function () {
                var requests = [];
                this.content.forEach(function (graph) {
                    graph.datasources.forEach(function (datasource) {
                        requests.push(datasource.generateStatsRequest());
                    });
                });
                return requests;
            },


            _mergeStatsRequests: function (requests) {
                var mergedRequests = {};
                requests.forEach(function (request) {

                    var requestStart =
                        request.start ? request.start : Date.now() - this.config.timeWindow;

                    var mergedRequestKey = request.url + '_' + requestFrom.toString();

                    // Create a placeholder for the merged request
                    if (! (mergedRequestKey in mergedRequests)) {
                        mergedRequests[mergedRequestKey] = {
                            url: request.url,
                            start: requestStart,
                            metrics: [],
                            datasources: [],
                            machine: request.machine,
                        };
                    }

                    var mergedRequest = mergedRequests[mergedRequestKey];
                    if (mergedRequest.metrics.indexOf(request.metricId) == -1) {
                        mergedRequest.metrics.push(request.metricId);
                        mergedRequest.datasources.push(request.datasource);
                    }
                }, this);
                return mergedRequests;
            }
        });
    }
);
