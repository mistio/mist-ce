define('app/views/script', ['app/views/page'],
    //
    //  Script View
    //
    //  @returns Class
    //
    function (PageView) {

        'use strict';

        return App.ScriptView = PageView.extend({

            templateName: 'script',

            //
            //  Computed Properties
            //

            isInline: function () {
                var script = this.get('model');
                if (!script.id) return false;
                return script.get('source') == 'inline';
            }.property('controller.model.source'),


            model: function () {
                return this.get('controller').get('model');
            }.property('controller.model'),


            //
            //  Initialization
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
            //  Methods
            //

            updateView: function () {

                this.updateModel();

                if (Mist.scriptsController.objectExists(
                    this.get('model').id)) {
                        // Nothing else matters
                }
            },


            updateModel: function () {
                var script = Mist.scriptsController.getRequestedScript();
                if (script)
                    this.get('controller').set('model', script);
            },


            //
            //  Actions
            //

            actions: {

                runClicked: function () {
                    Mist.scriptRunController.open(this.get('model'));
                },


                editClicked: function () {
                    Mist.scriptEditController.open(this.get('model'));
                },


                deleteClicked: function () {

                    var script = this.get('model');

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete script',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete "' +
                                    script.name + '" ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (!didConfirm) return;
                            Mist.scriptsController.deleteScript({
                                script: script,
                                callback: function (success) {
                                    if (!success) return;
                                    Mist.__container__.lookup('router:main').transitionTo('scripts');
                                }
                            })
                        }
                    });
                }
            }
        });
    }
);
