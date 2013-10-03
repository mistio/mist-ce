define('app/views/key_edit_dialog', [
    'text!app/templates/key_edit_dialog.html','ember'],
    /**
     * Key Edit dialog
     *
     * @returns Class
     */
    function(key_edit_dialog_html) {
        return Ember.View.extend({

            newName: null,

            template: Ember.Handlebars.compile(key_edit_dialog_html),

            attributeBindings: ['data-role'],

            newNameObserver: function() {
                if (this.newName) {
                    $('#edit-key-ok').button('enable');
                } else {
                    $('#edit-key-ok').button('disable');
                }
            }.observes('newName'),

            backClicked: function() {
                $('#edit-key-dialog').popup('close');
            },

            saveClicked: function() {
                var oldName = this.get('controller').get('model').name;
                if (oldName != this.newName) {
                    Mist.keysController.editKey(oldName, this.newName.trim());
                } else {
                    Mist.notificationController.notify('Please give a new name');
                }
            }
        });
    }
);
