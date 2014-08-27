define('app/models/datasource', ['app/models/datapoint', 'ember'],
    //
    //  Datasource Model
    //
    //  @returns Class
    //
    function (Datapoint) {

        'use strict';

        return Ember.Object.extend({


            //
            //
            //  Properties
            //
            //


            id: null,
            metric: null,
            machine: null,
            datapoints: null,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('datapoints', new Array());
            },


            //
            //
            //  Methods
            //
            //


            clear: function () {

            },


            update: function (datapoints) {

                datapoints.forEach(function (datapoint) {

                    var dtp = Datapoint.create(datapoint);
                    var lastTimestamp = this.getLastTimestamp();

                    // Override old datapoints
                    var datapointToOverride = this.datapoints.findBy('time', dtp.time);
                    if (datapointToOverride)
                        datapointToOverride.value = dtp.value;
                    else if (lastTimestamp < dtp.time.getTime())
                        this.datapoints.push(dtp);
                }, this);
            },


            getLastTimestamp: function () {
                var length = this.datapoints.length;
                if (!length) return 0;
                return this.datapoints[length - 1].time.getTime();
            },


            generateStatsRequest: function () {
                return {
                    datasource: this,
                    machineId: this.machine.id,
                    metricId: this.metric.id,
                    from: this.getLastTimestamp(),
                    url: '/backends/' + this.machine.backend.id +
                        '/machines/' + this.machine.id + '/stats',
                }
            }
        });
    }
);
