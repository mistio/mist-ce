define('app/models/base', ['ember'],
    //
    //  Base Model
    //
    // @returns Class
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
            name: null,
            selected: false,


            //
            //
            //  Initialization
            //
            //


            load: function () {
                this._convertProperties();
            }.on('init'),


            //
            //
            //  Methods
            //
            //


            update: function (data) {
                forIn(this, data, function (value, key) {
                    this.set(key, value);
                });
                this._convertProperties();
                this._processProperties();
            },


            //
            //
            //  Pseudo-Private methods
            //
            //


            _convertProperties: function () {
                var properties = this.get('convertProperties');
                if (!properties)
                    return;
                var processors = this.get('processProperties') || {};
                forIn(this, properties, function (after, before) {
                    var newValue = this.get(before);
                    if (after in processors)
                        newValue = processors[after](newValue);
                    this.set(after, newValue);
                    this.set(before, undefined);
                    delete this[before];
                });
            },


            _processProperties: function () {
                var processors = this.get('processProperties');
                if (!processors)
                    return;
                forIn(this, processors, function (fnc, property) {
                    this.set(property, fnc(this.get(property)));
                });
            },
        });
    }
);
