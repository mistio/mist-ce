define('app/views/key_edit_dialog', ['text!app/templates/key_edit_dialog.html','ember'],
    /**
     *  Key Edit dialog
     *
     *  @returns Class
     */
    function(key_edit_dialog_html) {
        return Ember.View.extend({

            /**
             *
             *  Properties
             *
             */

            newName: null,
            template: Ember.Handlebars.compile(key_edit_dialog_html),

            /**
             *
             *  Observers
             *
             */

            newNameObserver: function() {

                // Remove whitespaces from key name
                if (this.newName) {
                    this.set('newKeyName', this.newName.replace(/\W/g, ''));
                }

                if (this.newName) {
                    $('#rename-key-ok').removeClass('ui-state-disabled');
                } else {
                    $('#rename-key-ok').addClass('ui-state-disabled');
                }
            }.observes('newName'),



            /**
             * 
             *  Methods
             * 
             */

            close: function() {
                $('#rename-key-popup').popup('close');
                $('#new-key-name').val('');
            },



            /**
             *
             *  Actions
             *
             */

            actions: {

                backClicked: function() {
                    this.close();
                },

                saveClicked: function() {

                    // Get current and new name
                    var newName = this.newName;
                    var name = this.get('controller').get('model');
                    if (!name) {
                        // Occurs in key list page
                        name = Mist.keysController.getSelectedKeyName();
                    } else {
                        // Occurs in single key page
                        name = name.name;
                    }

                    if (name != newName) {

                        // Check if key name exist already
                        if (Mist.keysController.keyNameExists(newName)) {
                            Mist.notificationController.notify('Key name exists already');
                            return;
                        }

                        // Rename key
                        var that = this;
                        Mist.keysController.renameKey(name, newName, function() {
                            
                            // Redirect to new key location only if user is in single key view
                            if (window.location.hash == '#/keys/' + name) {
                                window.location.hash = '#/keys/' + newName.replace(/ /g, '');
                            }
                            that.close();
                        });
                    } else {
                        this.close(); // Psudo-save
                    }
                }
            }
        });
    }
);
