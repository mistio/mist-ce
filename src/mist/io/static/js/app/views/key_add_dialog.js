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
                		filetext = evt.target.result;
                		if (keytype == 'private'){
                			
                			beginkey = '-----BEGIN RSA PRIVATE KEY-----'
                			endkey = '-----END RSA PRIVATE KEY-----'
                			endkeyindex = filetext.length - endkey.length - 1;
                			
                    		if (filetext.indexOf(beginkey) != 0) {
                    			Mist.notificationController.notify('Private key should begin with ' + beginkey);
                				return;
                			} else if (filetext.indexOf(endkey) != endkeyindex) {
                				Mist.notificationController.notify('Private key should end with ' + endkey);
                				return;
                			}
                			$('#dialog-add-key #textarea-private-key').val(filetext).trigger('change');		
                		}
                		else if (keytype == 'public') {
                			if ((filetext.indexOf('ssh-rsa') != 0) &&
                				(filetext.indexOf('ssh-dsa') != 0)) {
                			
                			    Mist.notificationController.notify('Public key should begin with "ssh-rsa" or "ssh-dsa".');
                				return;		
                			}
                			$('#dialog-add-key #textarea-public-key').val(filetext).trigger('change');	
                		}
                     }
               };
               reader.readAsText(f, 'UTF-8');
            },
            
            newKeyClicked: function() {
                Mist.keyAddController.newKey();
                Mist.keyAddController.newKeyClear();
                $("#dialog-add-key").popup("close");
            },

            template: Ember.Handlebars.compile(key_add_dialog_html)

        });
    }
);
