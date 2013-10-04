define('app/views/key', [
    'app/models/machine',
    'app/views/mistscreen',
    'text!app/templates/key.html',
    'ember'
    ],
    /**
     * Single Key View
     *
     * @returns Class
     */
    function(Machine, MistScreen, key_html) {
        return MistScreen.extend({

            key: null,
            associatedMachines: null,

            template: Ember.Handlebars.compile(key_html), // cannot have template in home.pt as pt complains

            init: function() {
                this._super();
                this.set('key', this.get('controller').get('model'));
                if (this.key) {
                    this.machinesObserver();
                    Mist.keysController.getPubKey(this.key.name, '.public-key input');
                }
            },

            machinesObserver: function() {
                var machineList = new Array();
                if (this.key.machines) {
                    this.key.machines.forEach(function(key_machine) {
                        var machine = Mist.backendsController.getMachineById(key_machine[0], key_machine[1]);
                        if (machine) {
                            machineList.push(machine);
                        } else {
                            var backend = Mist.backendsController.getBackendById(key_machine[0]);
                            var item = {
                                id: key_machine[1],
                                name: key_machine[1],
                                state: backend ? 'terminated' : 'unknown',
                                backend: backend ? backend : key_machine[0],
                                isGhost: true,
                            };
                            machineList.push(Machine.create(item));
                        }
                    });
                }
                this.set('associatedMachines', machineList);
                Ember.run.next(function() {
                    $('#machines-list').listview('refresh');
                });
            }.observes('controller.model.machines'),

            displayPrivateClicked: function() {
                Mist.keysController.getPrivKey(this.key.name, '#private-key');
                $('#key-private-dialog').popup('open');
            },

            editClicked: function() {
                $('#new-key-name').val(this.key.name).trigger('change');
                $('#edit-key-dialog').popup('open');
            },

            deleteClicked: function() {
                var key = this.key;
                Mist.confirmationController.set('title', 'Delete key');
                Mist.confirmationController.set('text', 'Are you sure you want to delete "' + key.name + '" ?');
                Mist.confirmationController.set('callback', function() {
                    Mist.Router.router.transitionTo('keys');
                    Mist.keysController.deleteKey(key.name);
                });
                Mist.confirmationController.show();
            }
        });
    }
);
