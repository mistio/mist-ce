define('app/controllers/logs', ['app/models/log', 'ember'],
    //
    //  Users Controller
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
            userRequest: null,


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
                        info('before')
                        additionalContent.push(Log.create(log));
                    });
                    info('additionalContent', additionalContent);
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