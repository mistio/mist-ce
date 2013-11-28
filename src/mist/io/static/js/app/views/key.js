define('app/views/key', ['app/views/mistscreen', 'app/models/machine', 'text!app/templates/key.html'],
    /**
     * Single Key View
     *
     * @returns Class
     */
    function(MistScreen, Machine, key_html) {
        return MistScreen.extend({
            


            /**
             * 
             *  Properties
             * 
             */

            key: null,
            associatedMachines: null,
            template: Ember.Handlebars.compile(key_html),
            
            
            
            /**
             * 
             *  Initialization
             * 
             */

            renderKey: function() {
                this.set('key', this.get('controller').get('model'));
                if (this.key.name != ' ') { // This is the dummy key. It exists when key hasn't loaded yet
                    this.machinesObserver();
                    Mist.keysController.getPublicKey(this.key.name, function(publicKey) {
                        $('#public-key').val(publicKey);
                    });
                }
            }.on('init'),



            /**
             * 
             *  Observers
             * 
             */

            singleKeyResponseObserver: function() {
                if (Mist.keysController.singleKeyResponse) {
                    info('here it is!');
                    this.get('controller').set('model', Mist.keysController.singleKeyResponse);
                    this.renderKey();
                }
            }.observes('Mist.keysController.singleKeyResponse'),

            machinesObserver: function() {
                var machineList = [];
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
                        $('#single-key-machines').collapsible();
                    } catch (e) {}
                });
            }.observes('key.machines'),



            /**
             * 
             *  Actions
             * 
             */
            
            actions: {

                displayClicked: function() {
                    Mist.keysController.getPrivateKey(this.key.name, function(privateKey) {
                        $('#private-key').text(privateKey);
                        $('#private-key-dialog').popup('open');
                    });
                },

                backClicked: function() {
                    $('#private-key').val('');
                    $('#private-key-dialog').popup('close');
                },

                renameClicked: function() {
                    $('#new-key-name').val(this.key.name).trigger('change');
                    $('#rename-key-popup').popup('open');
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
            }
        });
    }
);
