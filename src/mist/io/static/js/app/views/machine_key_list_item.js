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

            getKeyUser: function() {
                var machine = this.get('controller').get('model');
                var keyUser = 'root';
                this.key.machines.forEach(function(machineKey) {
                    if (machineKey[1] == machine.id) {
                        if (machineKey[2]) {
                            keyUser = machineKey[2];
                        }
                    }
                });
                return keyUser;
            }.property('this.getKeyUser'),

            updateKeyUser: function(event) {
                $('.' + this.key.strippedname + ' .delete-key-container').hide();
                $('.' + this.key.strippedname + ' .ajax-loader').show();
                var machine = this.get('controller').get('model');
                Mist.keysController.associateUserKey(this.key, keyUser, this.key.name, machine);
            }
        });
    }
);
