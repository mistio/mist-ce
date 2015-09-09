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


            //
            //  Methods
            //

            open: function (script) {
                this.setProperties({
                    script: script,
                    newName: script.name,
                    newDescription: script.description
                });
                this.view.open();
            },

            close: function () {
                this.view.close();
            },

            save: function () {
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
        });
    }
);
