define('app/views/machine_tags', [],
    /**
     *  Machine Tags View
     *
     *  @returns Class
     */
    function () {
        return App.MachineTagsComponent = Ember.Component.extend({

            layoutName: 'machine_tags',
            controllerName: 'machineTagsController',

            //
            //  Actions
            //

            actions: {
                addClicked: function () {
                    Mist.machineTagsController.add();
                },

                backClicked: function () {
                    Mist.machineTagsController.close();
                }
            }
        });
    }
);
