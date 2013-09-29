define('app/views/key_add_dialog', [
    'text!app/templates/key_add_dialog.html','ember'],
    /**
     * Add Key dialog
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

            uploadClicked: function(keyType) {
                if (window.File && window.FileReader && window.FileList) {
                    $("#upload-" + keyType + "-key-input").click();
                } else {
                    alert('The File APIs are not fully supported in this browser.');
                }
            },

            uploadInputChanged: function(keyType) {
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        $('#textarea-' + keyType + '-key').val(evt.target.result).trigger('change');
                     }
               };
               reader.readAsText($('#upload-' + keyType + '-key-input')[0].files[0], 'UTF-8');
            },

            backClicked: function() {
                $("#create-key-dialog").popup("close");
                Mist.keyAddController.newKeyClear();
                if (this.getAssociatedMachine()){
                    Ember.run.next(function() {
                        $('#associate-key-dialog').popup('option', 'positionTo', '#associate-key-button').popup('open');
                    });
                }
            },

            createClicked: function() {
                var privateKey = $('#textarea-private-key').val().trim();
                var beginning = '-----BEGIN RSA PRIVATE KEY-----';
                var ending = '-----END RSA PRIVATE KEY-----';
                
                if (privateKey.indexOf(beginning) != 0) {
                    Mist.notificationController.notify('Private key should begin with ' + beginning);
                    return;
                } else if (privateKey.indexOf(ending) != privateKey.length - ending.length) {
                    Mist.notificationController.notify('Private key should end with ' + ending);
                    return;
                }
                
                Mist.keyAddController.newKey(this.getAssociatedMachine());
                try {
                    $('#manage-keys').panel('open');
                } catch (e) {}
                
            },
            
            getAssociatedMachine: function() {
                var machine;
                try {
                    machine = this.get('parentView').get('controller').get('model');
                } catch (e) {}
                return machine;
            }
        });
    }
);
