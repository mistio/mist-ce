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

            template: Ember.Handlebars.compile(key_html),

            init: function() {
                this._super();
                this.renderKey();
            },

            renderKey: function() {
                this.set('key', this.get('controller').get('model'));
                this.machinesObserver();
                Mist.keysController.getPubKey(this.key.name, '#public-key input');
            },

            singleKeyResponseObserver: function() {
                if (Mist.keysController.singleKeyResponse) {
                    this.get('controller').set('model', Mist.keysController.singleKeyResponse);
                    this.renderKey();
                }
            }.observes('Mist.keysController.singleKeyResponse'),

            machinesObserver: function() {
                var machineList = new Array();
                this.key.machines.forEach(function(key_machine) {
                    var machine = Mist.backendsController.getMachineById(key_machine[0], key_machine[1]);
                    if (!machine) {
                        var backend = Mist.backendsController.getBackendById(key_machine[0]);
                        machine = Machine.create({
                            id: key_machine[1],
                            name: key_machine[1],
                            state: backend ? 'terminated' : 'unknown',
                            backend: backend ? backend : key_machine[0],
                            isGhost: true,
                        });
                    }
                    machineList.push(machine);
                });
                this.set('associatedMachines', machineList);
                Ember.run.next(function() {
                    try {
                        $('#single-key-machines').trigger('create');
                        $('#single-key-machines').collapsible('refresh');
                    } catch (e) {}
                });
            }.observes('key.machines', 'key.machines.@each'),

            actions: {
                displayPrivateClicked: function() {
                    Mist.keysController.getPrivKey(this.key.name, '#private-key');
                    $('#private-key-dialog').popup('open');
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
                },

                back: function() {
                    $('#private-key').val('');
                    $('#private-key-dialog').popup('close');
                }
            }
        });
    }
);
