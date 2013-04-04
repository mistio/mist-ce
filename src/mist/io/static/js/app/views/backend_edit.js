define('app/views/backend_edit', [
    'text!app/templates/backend_edit_dialog.html',
    'ember'],
    /**
     *
     * Edit Backend Dialog
     *
     * @returns Class
     */
    function(edit_backend_dialog_html) {

        return Ember.View.extend({

            //TODO add event handlers for each element on the dialog

            deleteButtonClick: function(){
                $('#backend-delete-confirm').slideDown();
            },

            deleteCancelButtonClick: function(){
                $('#backend-delete-confirm').slideUp();
            },

            deleteConfirmButtonClick: function(){
                var that = this;
                $.ajax({
                    url: '/backends/' + this.backend.id,
                    type: 'DELETE',
                    success: function(result) {

                        $('#backend-delete-confirm').hide();
                        var i = Mist.backendsController.content.indexOf(that.backend);
                        // refresh backend buttons
                        Mist.backendsController.arrayContentWillChange();
                        Mist.backendsController.removeObject(that.backend);
                        Mist.backendsController.arrayContentDidChange();
                        Ember.run.next(function(){
                            $('#backend-buttons').controlgroup('refresh');
                        });
                        $("#edit-backend").popup("close");
                    }
                });
            },

            toggleBackend: function(){
                Mist.backend.set('enabled',!Mist.backend.enabled);
                Ember.run.next(function(){
                    $('.backend-toggle').slider('refresh');
                });
            },

            template: Ember.Handlebars.compile(edit_backend_dialog_html),
        });
    }
);
