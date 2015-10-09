define('app/controllers/script_edit', ['ember'],
    //
    //  Script Edit Controller
    //
    //  @returns Class
    //
    function () {

        'use strict';

        return Ember.Object.extend({

            //
            //  Properties
            //

            script: null,
            newName: '',
            newDescription: '',
            formReady: null,


            //
            //  Methods
            //

            open: function (script) {
                this.setProperties({
                    script: script,
                    newName: script.name,
                    newDescription: script.description
                });
                this._updateFormReady();
                this.view.open();
            },

            close: function () {
                this.view.close();
            },

            save: function () {
                if (this.formReady) {
                    var that = this;
                    Mist.scriptsController.renameScript({
                        script: this.get('script'),
                        newName: this.get('newName'),
                        newDescription: this.get('newDescription'),
                        callback: function (success) {
                            if (success)
                                that.close();
                        }
                    });
                }
            },

            _updateFormReady: function () {
                var formReady = false;
                if (this.script &&
                    ((this.newName != this.script.name) ||
                    (this.newDescription != this.script.description))) {
                    formReady = true;
                }
                this.set('formReady', formReady);
            },

            //
            //  Observers
            //

            formObserver: function () {
                Ember.run.once(this, '_updateFormReady');
            }.observes('newName', 'newDescription')
        });
    }
);
