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

            generateClicked: function() {
                Mist.keyAddController.generateKey();
            },

            uploadClicked: function() {
                if (window.File && window.FileReader && window.FileList) {
                    $('.upload-input').click();
                } else {
                    Mist.notificationController.notify('The File APIs are not fully supported in this browser.');
                }
            },

            uploadInputChanged: function() {
                if ($('.upload-input')[0].files[0]) {
                    $('#action-loader').fadeIn(200);
                    var reader = new FileReader();
                    reader.onloadend = function(evt) {
                        $('#action-loader').fadeOut(200);
                        if (evt.target.readyState == FileReader.DONE) {
                            $('#textarea-private-key').val(evt.target.result).trigger('change');
                         } else {
                             Mist.notificationsController.notify('Failed to upload file');
                             error('Failed to upload file');
                         }
                    };
                    reader.readAsText($('.upload-input')[0].files[0], 'UTF-8');
                }
            },

            backClicked: function() {
                $("#create-key-dialog").popup("close");
                Mist.keyAddController.newKeyClear();
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
                if ($("#add-backend").length) {
                    Mist.keysController.newKey(Mist.keyAddController.newKeyName, 
                                               Mist.keyAddController.newKeyPrivate
                                               , null, true);
                } else {
                    Mist.keyAddController.newKey(this.getAssociatedMachine());
                }
                try {
                    $('#manage-keys').panel('open');
                } catch (e) {}
            },

            getAssociatedMachine: function() {
                var machine = null;
                try {
                    machine = this.get('parentView').get('controller').get('model');
                } catch (e) {
                    info('Associated machine not found');
                }
                return machine;
            }
        });
    }
);
