define('app/models/datasource', ['app/models/datapoint', 'ember'],
    //
    //  Datasource Model
    //
    //  @returns Class
    //
    function (Datapoint) {

        'use strict';

        // Limit the amount of datapoints to
        // preserve memory (especially on mobile)
        var MAX_DATAPOINTS = 60;

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

                // Create an id and sanitize it for DOM usage
                var id = 'dt-' + this.machine.id + this.metric.id;
                id = id.replace(/[^\w]/g, '_');

                this.set('id', id);
                if (this.datapoints)
                    this.preFill();
                else
                    this.clear();

            },


            //
            //
            //  Methods
            //
            //


            clear: function () {
                this.set('datapoints', []);
            },

            preFill: function () {
                var datapoints = [];
                var step = Mist.graphsController.config.measurementStep
                var lastInitTimestamp = this.datapoints[0].time;
                for (var i = 0; i < DISPLAYED_DATAPOINTS - this.datapoints.length; i++) {
                    this.datapoints.unshift(Datapoint.create({
                        time: lastInitTimestamp - (i * step),
                        value: null,
                    }))
                }
            },

            update: function (datapoints) {
                datapoints.forEach(function (datapoint) {

                    var dtp = Datapoint.create(datapoint);
                    var lastTimestamp = this.getLastTimestamp();

                    // Override old datapoints
                    var datapointToOverride = this.datapoints.findBy('time', dtp.time);
                    if (datapointToOverride)
                        datapointToOverride.value = dtp.value;
                    else if (lastTimestamp < dtp.time.getTime()){
                        this.datapoints.push(dtp);
                        while (this.datapoints.length > MAX_DATAPOINTS)
                            this.datapoints.shift();
                    }
                }, this);
            },


            overwrite: function (datapoints) {
                this.set('datapoints', []);
                this.update(datapoints);
            },


            getLastTimestamp: function () {
                var length = this.datapoints.length;
                if (!length) return 0;
                return this.datapoints[length - 1].time.getTime();
            },


            getFirstTimestamp: function () {
                var length = this.datapoints.length;
                if (!length) return 0;
                if (this.datapoints[length - MAX_DATAPOINTS])
                    return this.datapoints[length - MAX_DATAPOINTS].time.getTime();
                return 0;
            }
        });
    }
);
