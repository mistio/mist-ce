define('app/controllers/datasources', ['app/models/datasource', 'ember'],
    //
    //  Datasources Controller
    //
    //  @returns Class
    //
    function (Datasource) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            content: [],
            loading: null,


            //
            //
            //  Methods
            //
            //


            addDatasource: function (args) {

                // An API call here
                // PUT /monitoring/datasources/ {
                //  backend_id: args.machine.backend.id
                //  machine_id: args.machine.id
                //  metric_id: args.metric.id
                // }

                var datasource = {
                    id: 'dt-' + parseInt(Math.random() * 10000),
                    machine: args.machine,
                    metric: args.metric
                }

                // on success
                this._addDatasource(datasource);

                if (args.callback) args.callback(
                    true, this.getDatasource(datasource.id));
            },


            getDatasource: function (datasourceId) {
                return this.content.findBy('id', datasourceId);
            },


            datasourceExists: function (datasourceId) {
                return !!this.getDatasource(datasourceId);
            },


            updateDatasource: function (args) {

            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _addDatasource: function (datasource) {
                Ember.run(this, function () {
                    if (this.datasourceExists(datasource.id)) return;
                    this.content.addObject(Datasource.create(datasource));
                    this.trigger('onDatasourceAdd');
                });
            },

        });
    }
);
