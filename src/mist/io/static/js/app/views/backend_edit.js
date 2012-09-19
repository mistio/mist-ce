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
            attributeBindings:['data-role', 'data-theme'],
            
            'data-role': 'content',
            'data-theme': 'c',
            
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
                    url: '/backends/' + this.backend.index,
                    type: 'DELETE',
                    success: function(result) {
                        history.back();
                        $('#backend-delete-confirm').hide();
                        var i = Mist.backendsController.content.indexOf(that.backend);
                        // refresh backend buttons
                        Mist.backendsController.arrayContentWillChange();
                        Mist.backendsController.removeObject(that.backend);
                        Mist.backendsController.arrayContentDidChange();
                        // update indexes of remaining backends
                        Mist.backendsController.content.forEach(function(obj,i){obj.index=i})
                    }
                });
            },
            
            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(edit_backend_dialog_html));
            },
        });
    }
);