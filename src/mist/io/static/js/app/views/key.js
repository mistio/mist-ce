define('app/views/key', ['app/views/mistscreen', 'app/models/machine', 'text!app/templates/key.html'],
    /**
     *  Single Key View
     *
     *  @returns Class
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

            renderPage: function() {

                // Get key model from controller
                this.set('key', this.get('controller').get('model'));

                // Dummy key doesn't have id
                if (this.key.id) {

                    // Get public key
                    Mist.keysController.getPublicKey(this.key.name, function(publicKey) {
                        $('#public-key').val(publicKey);
                    });

                    // Render machines
                    var machineList = [];
                    var backendsCtrl = Mist.backendsController;
                    this.key.machines.forEach(function(key_machine) {

                        var machine = backendsCtrl.getMachineById(key_machine[0], key_machine[1]);

                        // Construct ghost machine
                        if (!machine) {
                            var backend = backendsCtrl.getBackendById(key_machine[0]);
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
                            // TODO: Find optimal way of rerendering this shit
                            $('#single-key-machines').trigger('create');
                            $('#single-key-machines').collapsible();
                        } catch (e) {}
                    });
                }

            }.on('didInsertElement'),



            /**
             *
             *  Observers
             *
             */

            requestedKeyObserver: function() {
                var key = Mist.keysController.keyResponse;
                if (key) {
                    this.get('controller').set('model', key);
                    this.renderPage();
                }
            }.observes('Mist.keysController.keyResponse'),



            /**
             *
             *  Actions
             *
             */

            actions: {

                displayClicked: function() {
                    Mist.keysController.getPrivateKey(this.key.name, function(privateKey) {
                        $('#private-key-popup').popup('open');
                        $('#private-key').text(privateKey);
                    });
                },

                backClicked: function() {
                    $('#private-key-popup').popup('close');
                    $('#private-key').val('');
                },

                renameClicked: function() {
                    $('#rename-key-popup').popup('open');
                    $('#new-key-name').val(this.key.name).trigger('change');
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
