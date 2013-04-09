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

            generateClicked: function(){
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

            newKeyClicked: function(){
                Mist.keyAddController.newKey();
                Mist.keyAddController.newKeyClear();
                $("#dialog-add-key").popup("close");
            },

            template: Ember.Handlebars.compile(key_add_dialog_html)

        });
    }
);
