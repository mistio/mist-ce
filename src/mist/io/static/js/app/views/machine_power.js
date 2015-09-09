define('app/views/machine_power', [],
    /**
     *  Machine Power View
     *
     *  @returns Class
     */
    function () {
        return App.MachinePowerComponent = Ember.Component.extend({

            layoutName: 'machine_power',
            controllerName: 'machinePowerController',

            //
            //  Initialization
            //

            load: function () {
                // Add event listeners
                Mist.machinePowerController.on('onActionsChange', this, 'renderActions');
            }.on('didInsertElement'),

            unload: function () {
                // Remove event listeners
                Mist.machinePowerController.off('onActionsChange', this, 'renderActions');
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            renderActions: function () {
                Ember.run.next(function () {
                    $('#machine-power-popup').enhanceWithin();
                });
            },


            //
            //  Actions
            //

            actions: {
                actionClicked: function (action) {
                    Mist.machinePowerController.act(action);
                },

                backClicked: function () {
                    Mist.machinePowerController.close();
                }
            }
        });
    }
);
