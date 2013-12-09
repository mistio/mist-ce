define('app/views/key_add_dialog', ['text!app/templates/key_add_dialog.html','ember'],
    /**
     *  Key Add Dialog
     *
     *  @returns Class
     */
    function(key_add_dialog_html) {
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

            updateDoneButton: function() {
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

                generateClicked: function() {
                    Mist.keysController.generateKey(function(success, key) {
                        if (success) {
                            $('#create-key-private').val(key).trigger('change');
                        }
                    });
                },

                uploadClicked: function() {
                    if (window.File && window.FileReader && window.FileList) {
                        $('#create-key-upload').click();
                    } else {
                        Mist.notificationController.notify('Your browser does not support the HTML5 file API');
                    }
                },

                uploadInputChanged: function() {
                    var file = $('#create-key-upload')[0].files[0];
                    if (file) {
                        Mist.keysController.set('uploadingKey', true);
                        var reader = new FileReader();
                        reader.onloadend = function(evt) {
                            if (evt.target.readyState == FileReader.DONE) {
                                Mist.keyAddController.set('newKeyPrivate', evt.target.result);
                            } else {
                                Mist.notificationsController.notify('Failed to upload file');
                            }
                            Mist.keysController.set('uploadingKey', false);
                        };
                        reader.readAsText(file, 'UTF-8');
                    }
                },

                backClicked: function() {
                    Mist.keyAddController.close();
                },

                doneClicked: function() {
                    Mist.keyAddController.create();
                }
            },



            /**
             * 
             *  Observers
             * 
             */

            updateDoneButtonObserver: function() {
                Ember.run.once(this, 'updateDoneButton');
            }.observes('Mist.keysController.creatingKey', 'Mist.keyAddController.formReady')
        });
    }
);
