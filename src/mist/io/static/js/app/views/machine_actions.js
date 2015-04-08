define('app/views/machine_actions', ['app/views/templated'],
    /**
     *  Machine Actions View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return App.MachineActionsView = TemplatedView.extend({

            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Add event listeners
                Mist.machineActionsController.on('onActionsChange', this, 'renderActions');

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.machineActionsController.off('onActionsChange', this, 'renderActions');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            renderActions: function () {
                Ember.run.next(function () {
                    $('#machine-actions-popup').trigger('create');
                });
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                actionClicked: function (action) {
                    Mist.machineActionsController.act(action);
                },


                backClicked: function () {
                    Mist.machineActionsController.close();
                }
            }
        });
    }
);
