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


            content: [],
            loading: null,
            view: null,


            load: function() {
                if (!Mist.logs)  {
                    info('Log channel not yet ready');
                    Ember.run.later(this, this.load, 350);
                } else {
                    Mist.get('logs').on('logs', this, this.handleResponse);
                    Mist.get('logs').on('event', this, this.handleStream);
                    this.search();
                }
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
            //
            //  Pseudo-Private Methods
            //
            //


            _reload: function () {
                Ember.run.later(this, function () {
                    this.load();
                }, 2000);
            },


            _setContent: function (logs) {
                Ember.run(this, function () {
                    var newContent = [];
                    logs.forEach(function (log) {
                        newContent.push(Log.create(log));
                    });
                    this.set('content', newContent);
                    this.trigger('onLogListChange');
                });
            },


            _prependContent: function (logs) {
                Ember.run(this, function () {
                    var additionalContent = [];
                    logs.forEach(function (log) {
                        additionalContent.push(Log.create(log));
                    });
                    this.get('content').unshiftObjects(additionalContent);
                    this.trigger('onLogListChange');
                });
            },


            _appendContent: function (logs) {
                Ember.run(this, function () {
                    var additionalContent = [];
                    logs.forEach(function (log) {
                        additionalContent.push(Log.create(log));
                    });
                    this.get('content').pushObjects(additionalContent);
                    this.trigger('onLogListChange');
                });
            }
        });
    }
);
