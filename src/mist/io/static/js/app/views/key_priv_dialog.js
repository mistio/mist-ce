define('app/views/key_priv_dialog', [
    'text!app/templates/key_priv_dialog.html',
    'ember'
        ],
    /**
     * Private Key Dialog dialog
     *
     * @returns Class
     */
    function(key_priv_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(key_priv_dialog_html),

            attributeBindings: ['data-role',],
 
            back: function() {
                $('#private-key').val('');
                $('#key-private-dialog').popup('close');
            }
        });
    }
);
