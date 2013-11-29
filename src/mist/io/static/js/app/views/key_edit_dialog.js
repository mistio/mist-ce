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
                    var name = this.get('controller').get('model').name;
                    
                    if (name != newName) {
                        var that = this;
                        Mist.keysController.renameKey(name, newName, function() {
                            window.location.hash = '/keys/' + newName;
                            that.close();
                        });
                    } else {
                        this.close();
                    }
                }
            }
        });
    }
);
