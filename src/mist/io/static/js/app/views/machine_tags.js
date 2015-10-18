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
            //  Pseudo-Private Methods
            //

            _updateLaunchButton: function () {
               if (Mist.machineTagsController.formReady) {
                   $('#add-tag-ok').removeClass('ui-state-disabled');
               } else {
                   $('#add-tag-ok').addClass('ui-state-disabled');
               }
            },

            //
            //  Actions
            //

            actions: {
                addClicked: function () {
                    Mist.machineTagsController.add();
                },

                backClicked: function () {
                    Mist.machineTagsController.close();
                },

                addItem: function() {
                    Mist.machineTagsController.addItem();                 
                }
            },

            //
            //  Observers
            //

            formReadyObserver: function () {
               Ember.run.once(this, '_updateLaunchButton');
            }.observes('Mist.machineTagsController.formReady')
        });
    }
);
