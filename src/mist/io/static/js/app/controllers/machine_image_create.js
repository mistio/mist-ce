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
            creatingImage: null,
            image: Ember.Object.create({
                path: null
            }),
            callback: null,

            //
            //  Methods
            //

            open: function (callback) {
                this._updateFormReady();
                this.set('callback', callback);
                this.view.open();
            },

            close: function () {
                this._clear();
                this.view.close();
            },

            save: function() {
                if (this.formReady) {
                    this.set('creatingImage', true);
                    if (this.callback) {
                        this.callback(this.get('image.path'));
                        this.close();
                    }
                }
            },

            _clear: function() {
                this.setProperties({
                    'callback': null,
                    'creatingImage': null
                });
            },

            _updateFormReady: function() {
                var formReady = false;
                if (this.image.path) {
                    formReady = true;
                }

                if (this.creatingImage) {
                    formReady = false;
                }

                this.set('formReady', formReady);
            },

            // 
            // Observers
            // 

            formObserver: function() {
                Ember.run.once(this, '_updateFormReady');
            }.observes('image.path')
        });

    }
);