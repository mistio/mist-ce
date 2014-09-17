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


            //
            //
            // Initialization
            //
            //


            load: function () {
                this.set('id', 'graph-' + parseInt(Math.random() * 10000));
                this.set('datasources',
                    this.datasources.length ? this.datasources : []);
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
            }
        });
    }
);
