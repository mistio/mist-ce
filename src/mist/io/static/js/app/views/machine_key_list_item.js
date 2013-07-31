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
                $('.' + this.key.name + ' .delete-key-container').hide();
                $('.' + this.key.name + ' .ajax-loader').show();
                var machine = this.get('controller').get('model');
                Mist.keysController.disassociateKey(this.key, machine);
            },

            getKeyUser: function() {
                var machine = this.get('controller').get('model');
                var keyUser = 'root';
                this.key.machines.forEach(function(machineKey) {
                    if (machineKey[1] == machine.id) {
                        if (machineKey[2]) {
                            keyUser = machineKey[2];
                        } else {
                            keyUser = machine.getUser();
                        }
                    }
                });
                return keyUser;
            }.property('this.getKeyUser'),

            updateKeyUser: function(event) {
                $('.' + this.key.name + ' .delete-key-container').hide();
                $('.' + this.key.name + ' .ajax-loader').show();
                var machine = this.get('controller').get('model');
                var keyUser = $('.' + this.key.name + ' input').val();
                Mist.keysController.associateUserKey(keyUser, this.key.name, machine);
            }
        });
    }
);
