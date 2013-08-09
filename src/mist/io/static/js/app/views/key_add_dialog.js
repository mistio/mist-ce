define('app/views/key_add_dialog', [
    'text!app/templates/key_add_dialog.html','ember'],
    /**
     *
     * Add Key dialog
     *
     * @returns Class
     */
    function(key_add_dialog_html) {
        return Ember.View.extend({
            
            attributeBindings: ['data-role',],

            backClicked: function() {
                Mist.keyAddController.newKeyClear();
                $("#dialog-add-key").popup("close");
            },

            generateClicked: function() {
                $('#dialog-add-key .ajax-loader').fadeIn(200);
                var payload = {
                    'action': 'generate'
                }
                $.ajax({
                    url: '/keys',
                    type: "POST",
                    data: JSON.stringify(payload),
                    contentType: "application/json",
                    headers: { "cache-control": "no-cache" },
                    dataType: "json",
                    success: function(result) {
                        Mist.keyAddController.set('newKeyPublic', result.public);
                        Mist.keyAddController.set('newKeyPrivate', result.private);
                        $('#dialog-add-key .ajax-loader').hide();
                    }
                });
            },

            uploadClicked: function(keytype) {
                if (keytype == 'private' || keytype == 'public') {
                    if (window.File && window.FileReader && window.FileList) {
                        $("#dialog-add-key #upload-" + keytype + "-key-input").click();
                    } else {
                        alert('The File APIs are not fully supported in this browser.');
                    }
                }
            },
            
            uploadInputChanged: function(keytype) {
                var f = "";
                if (keytype == 'public') {
                f = $('#upload-public-key-input')[0].files[0];
                } 
                else if (keytype == 'private') {
                    f = $('#upload-private-key-input')[0].files[0];
                }
                var reader = new FileReader();
                reader.onloadend = function(evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        if (keytype == 'private'){
                            $('#dialog-add-key #textarea-private-key').val(evt.target.result).trigger('change');		
                        }
                        else if (keytype == 'public') {
                            $('#dialog-add-key #textarea-public-key').val(evt.target.result).trigger('change');	
                        }
                     }
               };
               reader.readAsText(f, 'UTF-8');
            },
            
            newKeyClicked: function() {
                
                publickey = $('#dialog-add-key #textarea-public-key').val().trim();
                privatekey = $('#dialog-add-key #textarea-private-key').val().trim();
                keytype = "";
                
                if (publickey.indexOf('ssh-rsa' ) == 0) {
                    keytype = 'RSA';
                } else if (publickey.indexOf('ssh-dss') == 0) {
                    keytype = 'DSA';
                } else {
                    Mist.notificationController.notify('Public key should begin with "ssh-rsa" or "ssh-dss"');
                    return;
                }
                
                beginning = '-----BEGIN ' + keytype + ' PRIVATE KEY-----';
                ending = '-----END ' + keytype + ' PRIVATE KEY-----';
                endingindex = privatekey.length - ending.length;
                
                if (privatekey.indexOf(beginning) != 0) {
                    Mist.notificationController.notify('Private key should begin with ' + beginning);
                    return;
                } else if (privatekey.indexOf(ending) != endingindex) {
                    Mist.notificationController.notify('Private key should end with ' + ending);
                    return;
                }
                
                Mist.keyAddController.newKey();
                Mist.keyAddController.newKeyClear();
                $("#dialog-add-key").popup("close");
            },

            template: Ember.Handlebars.compile(key_add_dialog_html)

        });
    }
);
