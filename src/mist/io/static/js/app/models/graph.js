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
                this.set('datasources',
                    this.datasources.length ? this.datasources : []);
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
        });
    }
);
