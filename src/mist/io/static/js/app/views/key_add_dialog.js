define('app/views/key_add_dialog', [
    'text!app/templates/key_add_dialog.html','ember'],
    /**
     * Key Add Dialog
     *
     * @returns Class
     */
    function(key_add_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(key_add_dialog_html),

            attributeBindings: ['data-role'],

            getAssociatedMachine: function() {
                return this.get('parentView').get('controller').get('model');
            },

            actions: {
                generateClicked: function() {
                    Mist.keyAddController.generateKey();
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
                    $('#create-key-dialog').popup('close');
                    Mist.keyAddController.clear();
                    
                    // Reopen associate key popup (works only in single machine view)
                    if (this.getAssociatedMachine()) {
                        Ember.run.later(function() {
                            $('#associate-key-dialog').popup('option', 'positionTo', '#associate-key-button').popup('open');
                        }, 150);
                    }
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
                    Mist.keyAddController.newKey(this.getAssociatedMachine());
                    
                    // Reopen machine manage keys dialog (works only in single machine view)
                    $('#manage-keys').panel('open');
                }
            }
        });
    }
);
