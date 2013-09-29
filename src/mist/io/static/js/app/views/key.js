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
            
            associatedMachines: null,
            key: null,
            
            template: Ember.Handlebars.compile(key_html), // cannot have template in home.pt as pt complains
            
            init: function() {
                this._super();
                this.set('key', this.get('controller').get('model'));
                
                var that = this;
                Ember.run.next(function() {
                    that.machinesObserver();
                });
            },

            machinesObserver: function() {
                machineList = new Array();
                if (this.key.machines) {
                    this.key.machines.forEach(function(key_machine) {
                        var machine = Mist.backendsController.getMachineById(key_machine[0], key_machine[1]);
                        if (machine) {
                            machineList.push(machine);
                        } else {
                            var backend = Mist.backendsController.getBackendById(key_machine[0]);
                            var state = 'unknown';
                            if (backend) {
                                state = 'terminated';
                            }
                            var item = {id: key_machine[1],
                                        name: key_machine[1],
                                        backend: backend ? backend : key_machine[0],
                                        state: state,
                                        isGhost: true};
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
                Mist.keysController.getPrivKey(this.key.name, "#private-key");
                $("#key-private-dialog").popup("open");
            },
            
            editClicked: function() {
                $("#new-key-name").val(this.key.name).trigger('change');
                $("#edit-key-dialog").popup("open");
            },

            deleteClicked: function() {
                var key = this.key;
                Mist.confirmationController.set('title', 'Delete key');
                Mist.confirmationController.set('text', 'Are you sure you want to delete "' + key.name + '" ?');
                Mist.confirmationController.set('callback', function() {
                    Mist.Router.router.transitionTo('keys'); 
                    Mist.keysController.deleteKey(key.name);
                });
                Mist.confirmationController.set('fromDialog', true);
                Mist.confirmationController.show();
            }
        });
    }
);
