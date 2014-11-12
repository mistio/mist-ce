define('app/controllers/logs', ['app/models/log' , 'ember'],
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
            selectedLogs: [],

            loading: false,
            logRequest: false,


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('content', []);
                this.set('loading', true);
            },


            //
            //
            //  Methods
            //
            //


            load: function(logs) {
                this._updateContent(logs);
                this.set('loading', false);
            },


            getLog: function(logId) {
                return this.content.findBy('id', logId);
            },


            getRequestedLog: function() {
                if (this.logRequest) {
                    return this.getLog(this.logRequest);
                }
            },


            logExists: function(logId) {
                return !!this.getLog(logId);
            },


            //
            //
            //  Pseudo-Private Methods
            //
            //

            _updateContent: function (logs) {
                Ember.run(this, function() {

                    // Remove deleted logs
                    this.content.forEach(function (log) {
                        if (!logs.findBy('id', log.id))
                            this._deleteLog(log.id);
                    }, this);

                    logs.forEach(function (log) {

                        var oldLog = this.getLog(log.id);

                        if (oldLog)
                            // Update existing logs
                            forIn(log, function (value, property) {
                                oldLog.set(property, value);
                            });
                        else
                            // Add new logs
                            this._addLog(log);
                    }, this);

                    this.trigger('onLogListChange');
                });
            },


            _addLog: function(log) {
                Ember.run(this, function() {
                    if (this.logExists(log.id)) return;
                    this.content.addObject(Log.create(log));
                    this.trigger('onLogAdd');
                });
            },


            _deleteLog: function(logId) {
                Ember.run(this, function() {
                    this.content.removeObject(this.getLog(logId));
                    this.trigger('onLogDelete');
                });
            },


            _renameLog: function(logId, newLogId) {
                Ember.run(this, function() {
                    if (this.logExists(logId))
                        this.getLog(logId).set('id', newLogId);
                    this.trigger('onLogRename');
                });
            },


            _updateSelectedLogs: function() {
                Ember.run(this, function() {
                    var newSelectedLogs = [];
                    this.content.forEach(function(log) {
                        if (log.selected) newSelectedLogs.push(log);
                    });
                    this.set('selectedLogs', newSelectedLogs);
                    this.trigger('onSelectedLogsChange');
                });
            },



            /**
             *
             *  Observers
             *
             */

            selectedLogsObserver: function() {
                Ember.run.once(this, '_updateSelectedLogs');
            }.observes('content.@each.selected')
        });
    }
);
