define('app/views/key_edit_dialog', ['text!app/templates/key_edit_dialog.html', 'ember'],
    /**
     *  Key Edit dialog
     * 
     *  @returns Class
     */
    function(key_edit_dialog_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(key_edit_dialog_html),

            /**
             *
             *  Actions
             *
             */

            actions: {

                backClicked: function() {
                    Mist.keyEditController.close();
                },

                saveClicked: function() {
                    Mist.keyEditController.save();
                }
            }
        });
    }
);
