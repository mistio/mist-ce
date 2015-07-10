define('app/controllers/logs', ['app/models/log', 'ember'],
    //
    //  Logs Controller
    //
    //  @returns Class
    //
    function (Log) {

        'use strict';

        return Ember.ArrayController.extend(Ember.Evented, {


            //
            //
            //  Properties
            //
            //


            model: [],
            loading: null,


            //
            //
            //  Pseudo-Private Methods
            //
            //


            _reload: function () {
                Ember.run.later(this, function () {
                    this.load();
                }, 2000);
            },


            _setModel: function (logs) {
                Ember.run(this, function () {
                    var newModel = [];
                    logs.forEach(function (log) {
                        newModel.push(Log.create(log));
                    });
                    this.set('model', newModel);
                    this.trigger('onLogListChange');
                });
            },


            _prependModel: function (logs) {
                Ember.run(this, function () {
                    var additionalModel = [];
                    logs.forEach(function (log) {
                        additionalModel.push(Log.create(log));
                    });
                    this.get('model').unshiftObjects(additionalModel);
                    this.trigger('onLogListChange');
                });
            },


            _appendModel: function (logs) {
                Ember.run(this, function () {
                    var additionalModel = [];
                    logs.forEach(function (log) {
                        additionalModel.push(Log.create(log));
                    });
                    this.get('model').pushObjects(additionalModel);
                    this.trigger('onLogListChange');
                });
            }
        });
    }
);
