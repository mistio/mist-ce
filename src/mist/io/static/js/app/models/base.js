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
                forIn(this, properties, function (after, before) {
                    this.set(after, this.get(before));
                    this.set(before, undefined);
                    delete this[before];
                });
            }
        });
    }
);
