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
                if (this.pollingMethod == 'XHR')
                    this._startXHRPolling()
                else if (this.pollingMethod == 'Socket')
                    this._startSocketPolling();
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


            _startSocketPolling: function () {


            },


            _startXHRPolling: function () {

                var that = this;

                poll();

                function poll () {

                    if (!that.isPolling) return;

                    var requests = that._gotherStatsRequests();
                    var remainingResponses = Object.keys(requests).length;

                    forIn(that, requests, function (request) {
                        var start = parseInt((request.from - that.config.measurementOffset) / 1000)
                        var stop = parseInt((Date.now() - that.config.measurementOffset) / 1000)
                        var data = {
                            start: start - 50,
                            stop:  stop + 50,
                            step: parseInt(that.config.measurementStep / 1000),
                            v: 2,
                            metrics: request.metrics
                        }
                        info(data);
                        $.ajax({
                            url: request.url,
                            type: 'GET',
                            async: true,
                            dataType: 'json',
                            data: data,
                            complete: function (jqXHR) {
                                handleResponse(jqXHR.status == 200, request, jqXHR.responseJSON, start, stop);
                            }
                        });
                    });

                    function handleResponse (success, request, response, start, stop) {

                        info('response', response);

                        // If the request was successfull, feed the datasouces
                        // with the new data
                        if (success)
                            request.datasources.forEach(function (datasource) {
                                info('datasource', datasource);
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


            _gotherStatsRequests: function () {

                // Gother requests from each datasource
                var requests = [];
                this.content.forEach(function (graph) {
                    graph.datasources.forEach(function (datasource) {
                        requests.push(datasource.generateStatsRequest());
                    });
                });

                // Merge requests to reduce ajax calls
                var mergedRequests = {};
                requests.forEach(function (request) {

                    var requestFrom =
                        request.from ? request.from : Date.now() - this.config.timeWindow;

                    var mergedRequestKey = request.url + '_' + requestFrom.toString();

                    // Create a placeholder for the merged request
                    if (! (mergedRequestKey in mergedRequests)) {
                        mergedRequests[mergedRequestKey] = {
                            url: request.url,
                            from: requestFrom,
                            metrics: [],
                            datasources: []
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
