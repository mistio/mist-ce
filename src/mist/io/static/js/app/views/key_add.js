define('app/views/key_add', ['app/views/templated', 'ember'],
    /**
     *  Key Add View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return TemplatedView.extend({

            /**
             *
             *  Methods
             *
             */

            updateAddButton: function () {
                if (Mist.keysController.addingKey || !Mist.keyAddController.formReady) {
                    $('#add-key-ok').addClass('ui-state-disabled');
                } else {
                    $('#add-key-ok').removeClass('ui-state-disabled');
                }
            },


            /**
             *
             *  Actions
             *
             */

            actions: {


                generateClicked: function () {
                    Mist.keysController.generateKey(function (success, key) {
                        if (success)
                            Mist.keyAddController.set('newKeyPrivate', key);
                    });
                },


                uploadClicked: function () {
                    if (window.File && window.FileReader && window.FileList) {
                        // Dynamically click the hidden input
                        // field to present the folder dialog
                        $('#add-key-upload').click();
                    } else {
                        Mist.notificationController.notify('Your browser does not support the HTML5 file API');
                    }
                },


                uploadInputChanged: function () {
                    Mist.keyAddController.uploadKey($('#add-key-upload')[0].files[0]);
                },


                backClicked: function () {
                    Mist.keyAddController.close();
                },


                addClicked: function () {
                    Mist.keyAddController.add();
                }
            },


            /**
             *
             *  Observers
             *
             */

            updateDoneButtonObserver: function () {
                Ember.run.once(this, 'updateAddButton');
            }.observes('Mist.keysController.addingKey', 'Mist.keyAddController.formReady')
        });
    }
);
