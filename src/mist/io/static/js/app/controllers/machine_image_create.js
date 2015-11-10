define('app/controllers/machine_image_create', ['ember'],
    //
    //  Machine Image Create Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            formReady: null,

            //
            //  Methods
            //

            open: function (script) {
                this._updateFormReady();
                this.view.open();
            },

            close: function () {
                this.view.close();
            },

            save: function() {

            },

            _updateFormReady: function() {
                var formReady = false;

                this.set('formReady', formReady);
            }

        });

    }
);