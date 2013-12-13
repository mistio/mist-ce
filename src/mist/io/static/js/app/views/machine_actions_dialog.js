define('app/views/machine_actions_dialog', [
    'text!app/templates/machine_actions_dialog.html',
    'ember'
    ],
    /**
     *
     * Confirmation Dialog
     *
     * @returns Class
     */
    function(machine_actions_dialog_html) {
        return Ember.View.extend({
            tagName: false,

        });
    }
);
