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
            
            change: function(e) {
                if ($(e.target).is('input')) {
                    var f = e.target.files[0]
                    var reader = new FileReader();
                    reader.onloadend = function(evt) {
                        if (evt.target.readyState == FileReader.DONE) {
                            if(e.target.id == 'upload-public-key-input') {
                                $('#dialog-add-key #textarea-public-key').val(evt.target.result).trigger('change');
                            } 
                            else if (e.target.id == 'upload-private-key-input') {
                                $('#dialog-add-key #textarea-private-key').val(evt.target.result).trigger('change');   
                            }
                         }
                    };
                    reader.readAsText(f, 'UTF-8');
                 }
            },
             
            click: function(e) {
                var target_id = e.target.id
                if (target_id == 'upload-private-key' || target_id == 'upload-public-key') {
                    if (window.File && window.FileReader && window.FileList) {
                        $("#dialog-add-key #" + target_id + "-input").click();
                    } else {
                        alert('The File APIs are not fully supported in this browser.');
                    }                    
                }
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
