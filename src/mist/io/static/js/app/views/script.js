define('app/views/script', ['app/views/mistscreen'],
    //
    //  Script View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return PageView.extend({


            //
            //
            //  Computed Properties
            //
            //


            isInline: function () {
                var script = this.get('controller').get('model');
                if (!script.id) return false;
                return script.get('source') == 'inline';
            }.property('controller.model.source'),


            //
            //
            //  Initialization
            //
            //


            load: function () {

                // Add event listeners
                Mist.scriptsController.on('onChange', this, 'updateView');
                this.updateView();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.scriptsController.on('onChange', this, 'updateView');

            }.on('willDestroyElement'),


            //
            //
            //  Methods
            //
            //


            updateView: function () {

                this.updateModel();

                if (Mist.scriptsController.objectExists(
                    this.get('controller').get('model').id)) {
                        // Nothing else matters
                }
            },


            updateModel: function () {
                var script = Mist.scriptsController.getRequestedScript();
                if (script)
                    this.get('controller').set('model', script);
            },


            actions: {
                runClicked: function () {
                    Mist.scriptRunController.open(this.get('controller').get('model'));
                }
            }
        });
    }
);
