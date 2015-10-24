define('app/controllers/logs', ['app/models/log'],
    //
    //  Logs Controller
    //
    //  @returns Class
    //
    function (Log) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {

            //
            //  Properties
            //

            model: [],
            loading: null,
            view: null,
            prettyTimeReady: false,

            load: function() {
                if (!Mist.get('logs') || !Mist.get('logs').channel)  {
                    info('Log channel not yet ready');
                    Ember.run.later(this, this.load, 350);
                } else {
                    if (Mist.get('logs').channel._listeners.event == undefined)
                        Mist.get('logs').on('event', this, this.handleStream);
                    if (Mist.get('logs').channel._listeners.logs == undefined)
                        Mist.get('logs').on('logs', this, this.handleResponse);
                    this.search();
                }
            },

            unload: function() {
                this.set('model', []);
            },

            search: function() {
                if (this.get('view'))
                    this.get('view').search();
            },

            handleResponse: function(logs){
                if (this.get('view'))
                    this.get('view').handleResponse(logs);
            },

            handleStream: function(log) {
                if (this.get('view'))
                    this.get('view').handleStream(log);
            },


            //
            //  Pseudo-Private Methods
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
