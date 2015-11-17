define('app/models/stats_request', ['ember'],
    //
    //  Stats Request Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        var REQUEST_COUNTER = 0;

        return Ember.Object.extend({

            //
            //  Properties
            //

            id: null,
            url: null,
            from: null,
            until: null,
            response: null,
            datasources: null,
            pendingResponse: null,


            //
            //  Initialization
            //

            load: function () {
                var machine = this.datasources[0].machine;
                this.setProperties({
                    metrics: [],
                    id: REQUEST_COUNTER++,
                    url: '/clouds/' + machine.cloud.id +
                        '/machines/' + machine.id + '/stats'
                });
            }.on('init'),


            //
            //  Methods
            //

            canMerge: function (statsRequest) {
                if (this.url == statsRequest.url)
                    if (this.from == statsRequest.from)
                        if (this.until == statsRequest.until)
                            return true;
                return false;
            },

            merge: function (statsRequest) {
                this.datasources.pushObjects(statsRequest.datasources);
                this._updateMetrics();
            },


            //
            //  Pseudo-Private Methods
            //

            _updateMetrics: function () {
                this.datasources.forEach(function (datasource) {
                    this.metrics.addObject(datasource.metric.id);
                }, this);
            }
        });
    }
);
