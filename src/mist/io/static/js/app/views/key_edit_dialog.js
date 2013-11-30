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
                $('#new-key-name').val('');
                $('#rename-key-popup').popup('close');
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
                    var newName = this.newName.trim();
                    var name = this.get('controller').get('model');
                    if (!name) {
                        name = Mist.keysController.getSelectedKeyName();
                    } else {
                        name = name.name;
                    }
                    
                    if (name != newName) {
                        
                        // Check if name exists already
                        var found = false;
                        Mist.keysController.content.some(function(key) {
                            if (key.name == newName) {
                                Mist.notificationController.notify('There is a key named "' + newName +'" already');
                                return found = true;
                            }
                        });
                        if (found) return;
                        
                        // Create key
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
