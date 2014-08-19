define('app/models/graph', ['ember'],
    //
    //  Graph Model
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            id: null,
            title: null,
            isBuiltIn: null,
            datasources: null,


            //
            //
            // Initialization
            //
            //


            load: function () {
                this.set('datasources', []);
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            addDatasource: function (datasource) {
                Ember.run(this, function () {
                    this.datasources.addObject(datasource);
                    this.trigger('onDatasourceAdd');
                });
            },


            removeDatasource: function (datasource) {
                Ember.run(this, function () {
                    this.datasources.removeObject(datasource);
                    this.trigger('onDatasourceRemove');
                });
            },

/*

            updateData: function (data) {

                if (this.pendingCreation) return;

                Ember.run(this, function () {
                    for (var metricId in data) {
                        var metric = this.getMetric(metricId);
                        if (metric) {
                            metric.datapoints.addObjects(data[metricId]);
                            var datapoints = metric.datapoints;
                            if (datapoints.length > MAX_BUFFER_DATA * 2) {
                                // If we don't multiply by two, the code will
                                // end up trimming a single datapoint on each
                                // update, which consumes resources for nothing
                                var spare = datapoints.length - MAX_BUFFER_DATA;
                                metric.datapoints = datapoints.slice(spare);
                            }
                        }
                    }
                    this.trigger('onDataUpdate', this.metrics[0].datapoints);
                });
            },


            insertDummyData: function (metric) {

                // If metric doesn't have any datapoints, add one
                if (!metric.datapoints.length)
                    metric.datapoints =
                        [new Datapoint(prevTimestamp - step)]; // BUG!!!

                var datapoints = metric.datapoints;
                var step = Mist.monitoringController.request.step;

                while (datapoints.length < MAX_BUFFER_DATA)
                    datapoints.unshift(
                        new Datapoint(datapoints[0].time - step));
            },
            */
        });

/*
        function Datapoint(timestamp, value) {
           this.time = new Date(timestamp || null);
           this.value = value || null;
        };
*/
    }
);
