define('app/controllers/datasources', ['app/models/datasource', 'ember'],
    //
    //  Datasources Controller
    //
    //  @returns Class
    //
    function (Datasource) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            model: [],
            loading: null,


            //
            //
            //  Methods
            //
            //


            addDatasource: function (args) {

                // An API call here
                // PUT /monitoring/datasources/ {
                //  cloud_id: args.machine.cloud.id
                //  machine_id: args.machine.id
                //  metric_id: args.metric.id
                // }

                //id: ('dt-' + args.machine.id + args.metric.id).replace(/[^\w]/g, '_'),
                //id: 'dt-' + parseInt(Math.random() * 10000),

                var datasource = new Object({
                    id: ('dt-' + args.machine.id + args.metric.id).replace(/[^\w]/g, '_'),
                    machine: args.machine,
                    metric: args.metric
                });
                datasource.id = datasource.id.replace(/\.*/g, '');

                //info(datasource);

                if (this.datasourceExists(datasource.id)) {
                    if (args.callback)
                        args.callback(false, this.getDatasource(datasource.id));
                    return;
                }

                // on success
                this._addDatasource(datasource);

                if (args.callback) args.callback(
                    true, this.getDatasource(datasource.id));
            },


            getDatasource: function (datasourceId) {
                return this.model.findBy('id', datasourceId);
            },


            datasourceExists: function (datasourceId) {
                return !!this.getDatasource(datasourceId);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _addDatasource: function (datasource) {
                Ember.run(this, function () {
                    if (this.datasourceExists(datasource.id)) return;
                    this.model.addObject(Datasource.create(datasource));
                    this.trigger('onDatasourceAdd');
                });
            },

        });
    }
);
