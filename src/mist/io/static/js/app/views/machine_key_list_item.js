define('app/views/machine_key_list_item', [
    'text!app/templates/machine_key_list_item.html',
    'ember'
    ],
    /**
     *
     * Key List Item View
     *
     * @returns Class
     */
    function(machine_key_list_item_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_key_list_item_html),

            disassociateClick: function(event) {
                var machine = this.get('controller').get('model');
                Mist.keysController.disassociateKey(this.key, machine);
            }
        });
    }
);
