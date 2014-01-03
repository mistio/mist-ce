define('app/views/key_add_dialog', ['text!app/templates/key_add_dialog.html', 'ember'],
    /**
     *  Key Add View
     *
     *  @returns Class
     */
    function (key_add_dialog_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(key_add_dialog_html),


            /**
             *
             *  Methods
             *
             */

            updateDoneButton: function () {
                if (Mist.keysController.creatingKey || !Mist.keyAddController.formReady) {
                    $('#create-key-ok').addClass('ui-state-disabled');
                } else {
                    $('#create-key-ok').removeClass('ui-state-disabled');
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
                            $('#create-key-private').val(key).trigger('change');
                    });
                },


                uploadClicked: function () {
                    if (window.File && window.FileReader && window.FileList) {
                        // Dynamically click the hidden input
                        // field to present the folder dialog
                        $('#create-key-upload').click();
                    } else {
                        Mist.notificationController.notify('Your browser does not support the HTML5 file API');
                    }
                },


                uploadInputChanged: function () {
                    Mist.keyAddController.uploadKey($('#create-key-upload')[0].files[0]);
                },


                backClicked: function () {
                    Mist.keyAddController.close();
                },


                doneClicked: function () {
                    Mist.keyAddController.create();
                }
            },


            /**
             *
             *  Observers
             *
             */

            updateDoneButtonObserver: function () {
                Ember.run.once(this, 'updateDoneButton');
            }.observes('Mist.keysController.creatingKey', 'Mist.keyAddController.formReady')
        });
    }
);
