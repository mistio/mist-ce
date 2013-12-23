define('app/views/key', ['app/views/mistscreen', 'app/models/machine', 'text!app/templates/key.html'],
    /**
     *  Single Key View
     * 
     *  @returns Class
     */
    function(MistScreen, Machine, key_html) {
        return MistScreen.extend({

            /**
             *  Properties
             */

            key: null,
            machines: [],
            template: Ember.Handlebars.compile(key_html),

            /**
             * 
             *  Initialization
             * 
             */

            init: function() {
                this._super();
                Mist.keysController.one('onLoad', this, 'load');
                Mist.backendsController.on('onMachineListChange', this, 'updateMachines');
            },


            load: function() {
                Ember.run(this, function() {
                    this.updateCurrentKey();
                    if (this.key.id) {
                        this.updateMachines();
                        Ember.run.next(this, 'showPublicKey');
                    }
                });
            }.on('didInsertElement'),



            /**
             * 
             *  Methods
             * 
             */

            updateCurrentKey: function() {
                Ember.run(this, function() {
                    var key = Mist.keysController.getRequestedKey();
                    if (key) this.get('controller').set('model', key);
                    this.set('key', this.get('controller').get('model'));
                });
            },


            updateMachines: function() {
                if (!$('#single-key-page').length) {
                    Mist.backendsController.off('onMachineListChange');
                    return;
                }

                Ember.run(this, function() {
                    var newMachines = [];
                    this.key.machines.forEach(function(machine) {
                        var newMachine = Mist.backendsController.getMachineById(machine[0], machine[1]);
                        if (!newMachine) {
                            var backend = Mist.backendsController.getBackendById(machine[0]);
                            newMachine = Machine.create({
                                id: machine[1],
                                name: machine[1],
                                state: backend ? 'terminated' : 'unknown',
                                backend: backend ? backend : machine[0],
                                isGhost: true,
                            });
                        }
                        newMachines.push(newMachine);
                    });
                    this.set('machines', newMachines);
                });
            },


            renderMachines: function() {
                Ember.run.next(function() {
                    if ($('#single-key-machines').collapsible) {
                        $('#single-key-machines').collapsible();
                        $('#single-key-machines').trigger('create');
                    }
                });
            },


            showPublicKey: function() {
                Mist.keysController.getPublicKey(this.key.id, function(success, keyPublic) {
                    if (success) {
                        $('#public-key').val(keyPublic);
                    }
                });
            },



            /**
             * 
             *  Actions
             * 
             */

            actions: {

                displayClicked: function() {
                    Mist.keysController.getPrivateKey(this.key.id, function(success, keyPrivate) {
                        if (success) {
                            $('#private-key-popup').popup('open');
                            $('#private-key').val(keyPrivate);
                        }
                    });
                },

                backClicked: function() {
                    $('#private-key-popup').popup('close');
                    $('#private-key').val('');
                },

                renameClicked: function() {
                    Mist.keyEditController.open(this.key.id, function(success, newKeyId) {
                        if (success) {
                            window.location.hash = '#/keys/' + newKeyId;
                        }
                    });
                },

                deleteClicked: function() {
                    var keyId = this.key.id;
                    Mist.confirmationController.set('title', 'Delete key');
                    Mist.confirmationController.set('text', 'Are you sure you want to delete "' + keyId + '" ?');
                    Mist.confirmationController.set('callback', function() {
                        Mist.Router.router.transitionTo('keys');
                        Mist.keysController.deleteKey(keyId);
                    });
                    Mist.confirmationController.show();
                }
            },



            /**
             * 
             *  Observers
             * 
             */

            modelObserver: function() {
                Ember.run.once(this, 'load');
                Mist.backendsController.off('onMachineListChange');
                Mist.backendsController.on('onMachineListChange', this, 'updateMachines');
            }.observes('controller.model'),


            machinesObserver: function() {
                Ember.run.once(this, 'renderMachines');
            }.observes('machines')
        });
    }
);
