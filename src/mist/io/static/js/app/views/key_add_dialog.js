define('app/views/key_add_dialog', ['text!app/templates/key_add_dialog.html','ember'],
    /**
     *  Key Add Dialog
     *
     *  @returns Class
     */
    function(key_add_dialog_html) {
        return Ember.View.extend({

            /**
             * 
             *  Properties
             * 
             */

            template: Ember.Handlebars.compile(key_add_dialog_html),

            /**
             * 
             *  Actions
             * 
             */

            actions: {

                generateClicked: function() {
                    Mist.keysController.generateKey(function(key) {
                        $('#textarea-private-key').val(key).trigger('change');
                    });
                },

                uploadClicked: function() {
                    if (window.File && window.FileReader && window.FileList) {
                        $('.upload-input').click();
                        return;
                    }
                    Mist.notificationController.notify('Your browser does not support the HTML5 file API');
                },

                uploadInputChanged: function() {
                    var file = $('.upload-input')[0].files[0];
                    if (file) {
                        $('#action-loader').fadeIn();
                        var reader = new FileReader();
                        reader.onloadend = function(evt) {
                            if (evt.target.readyState == FileReader.DONE) {
                                $('#textarea-private-key').val(evt.target.result).trigger('change');
                                $('#action-loader').fadeOut();
                             } else {
                                 Mist.notificationsController.notify('Failed to upload file');
                                 error('Failed to upload file');
                             }
                        };
                        reader.readAsText(file, 'UTF-8');
                    }
                },

                backClicked: function() {
                    $('#create-key-popup').popup('close');
                    Mist.keyAddController.clear();
                },

                createClicked: function() {
                    var privateKey = $('#textarea-private-key').val().trim();
                    var beginning = '-----BEGIN RSA PRIVATE KEY-----';
                    var ending = '-----END RSA PRIVATE KEY-----';
                    if (privateKey.indexOf(beginning) != 0) {
                        Mist.notificationController.notify('Private key should begin with: ' + beginning);
                        return;
                    } else if (privateKey.indexOf(ending) != privateKey.length - ending.length) {
                        Mist.notificationController.notify('Private key should end with: ' + ending);
                        return;
                    }
                    var that = this;
                    Mist.keysController.createKey(
                        Mist.keyAddController.newKeyName,
                        Mist.keyAddController.newKeyPrivate, 
                        function() {
                            $('#create-key-popup').popup('close');
                            Mist.keyAddController.clear();
                            // Reopen machine manage keys dialog (works only in single machine view)
                            $('#manage-keys').panel('open');
                    });
                }
            }
        });
    }
);
