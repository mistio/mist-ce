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
            view: null,
            title: null,
            isEmpty: null,
            datasources: null,


            //
            //
            //  Computed Properties
            //
            //


            unit: function () {
                return this.datasources && this.datasources.length ?
                    this.datasources[0].metric.unit : '';
            }.property('datasources'),


            isBuiltIn: function () {
                return this.datasources && this.datasources.length ?
                    !!Mist.metricsController.builtInMetrics.findBy('id', this.datasources[0].metric.id)
                    : false;
            }.property('datasources'),


            isMultiline: function () {
                return !!(this.datasources.length > 1);
            }.property('datasources.@each'),


            //
            //
            // Initialization
            //
            //


            load: function () {
                var dts;
                if (this.datasources.length);
                    dts=this.datasources;

                this.set('id', 'graph-' + (dts.length ? dts[0].id : ''));
                this.set('datasources',
                    dts ? dts : []);
                this.set('isEmpty', true);
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


            getFirstDatapoint: function () {
                return this.get('displayedData')[this.datasources[0].id][0];
            },

            getLastDatapoint: function () {
                return this.get('displayedData')[this.datasources[0].id][DISPLAYED_DATAPOINTS - 1];
            }
        });
    }
);
