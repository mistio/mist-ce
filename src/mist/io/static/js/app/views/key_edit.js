define('app/views/key_edit', ['app/views/popup'],
    /**
     *  Key Edit View
     *
     *  @returns Class
     */
    function (PopupComponent) {

        return App.KeyEditComponent = PopupComponent.extend({

            layoutName: 'key_edit',
            controllerName: 'keyEditController',
            popupId: '#rename-key-popup',

            //
            // Methods
            //


            updateSaveButton: function () {
                if (Mist.keyEditController.formReady) {
                    $('#rename-key-ok').removeClass('ui-state-disabled');
                } else {
                    $('#rename-key-ok').addClass('ui-state-disabled');
                }
            },


            //
            // Actions
            //

            actions: {


                backClicked: function () {
                    Mist.keyEditController.close();
                },


                saveClicked: function () {
                    Mist.keyEditController.save();
                }
            },


            //
            // Observers
            //
            

            updateSaveButtonObserver: function () {
                Ember.run.once(this, 'updateSaveButton');
            }.observes('Mist.keyEditController.formReady')
        });
    }
);
