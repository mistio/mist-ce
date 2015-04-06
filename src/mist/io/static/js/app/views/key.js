define('app/views/key', ['app/views/page', 'app/models/machine'],
    /**
     *  Single Key View
     *
     *  @returns Class
     */
    function (PageView, Machine) {
        return App.KeyView = PageView.extend({

            /**
             *  Properties
             */

            key: null,
            machines: [],


            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Add event listeners
                Mist.keysController.on('onKeyListChange', this, 'updateView');
                Mist.keysController.on('onKeyDisassociate', this, 'updateMachines');
                Mist.backendsController.on('onMachineListChange', this, 'updateMachines');

                this.updateView();

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.keysController.off('onKeyListChange', this, 'updateView');
                Mist.keysController.off('onKeyDisassociate', this, 'updateMachines');
                Mist.backendsController.off('onMachineListChange', this, 'updateMachines');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

            updateView: function () {

                this.updateModel();

                // In case keys haven't been loaded yet, a
                // dummy model will be passed to the view so
                // that things won't brake. This model doesn't
                // have an "id" attribute.
                if (Mist.keysController.keyExists(this.key.id)) {
                    this.updateMachines();
                    this.showPublicKey();
                }
            },


            updateModel: function () {

                // Check if user has requested a specific key
                // through the address bar and retrieve it
                var key = Mist.keysController.getRequestedKey();
                if (key)
                    this.get('controller').set('model', key);

                // Get a reference of key model
                this.set('key', this.get('controller').get('model'));
            },


            updateMachines: function () {

                // Construct an array of machine models
                // that are associated with this key
                var newMachines = [];
                this.key.machines.forEach(function (machine) {
                    var newMachine = Mist.backendsController.getMachine(machine[1], machine[0]);
                    if (!newMachine) {
                        var backend = Mist.backendsController.getBackend(machine[0]);
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

                // These machines will be rendered
                // under the "machines" collapsible
                this.set('machines', newMachines);
            },


            renderMachines: function () {
                Ember.run.next(function () {
                    if ($('#single-key-machines').collapsible)
                        $('#single-key-machines').collapsible()
                                                 .trigger('create');
                });
            },


            showPublicKey: function () {
                Mist.keysController.getPublicKey(this.key.id, function (success, keyPublic) {
                    if (success)
                        $('#public-key').val(keyPublic);
                });
            },


            /**
             *
             *  Actions
             *
             */

            actions: {

                displayClicked: function () {
                    Mist.keysController.getPrivateKey(this.key.id, function (success, keyPrivate) {
                        if (success) {
                            Mist.dialogController.open({
                                type: DIALOG_TYPES.BACK,
                                head: 'Private Key',
                                body: [
                                    {
                                        command: keyPrivate
                                    }
                                ],
                            });
                        }
                    });
                },


                renameClicked: function () {
                    var key = this.key;
                    Mist.keyEditController.open(key.id, function (success) {
                        if (success) {
                            Mist.Router.router.transitionTo('key', key);
                        }
                    });
                },


                deleteClicked: function () {

                    var keyId = this.key.id;

                    Mist.dialogController.open({
                        type: DIALOG_TYPES.YES_NO,
                        head: 'Delete key',
                        body: [
                            {
                                paragraph: 'Are you sure you want to delete "' +
                                    keyId + '" ?'
                            }
                        ],
                        callback: function (didConfirm) {
                            if (didConfirm) {
                                Mist.keysController.deleteKey(keyId, function (success) {
                                    if (success)
                                        Mist.Router.router.transitionTo('keys');
                                });
                            }
                        }
                    });
                }
            },


            /**
             *
             *  Observers
             *
             */

            modelObserver: function () {
                Ember.run.once(this, 'updateView');
            }.observes('controller.model'),


            modelMachinesObserver: function () {
                Ember.run.once(this, 'updateMachines');
            }.observes('key.machines'),


            viewMachinesObserver: function () {
                Ember.run.once(this, 'renderMachines');
            }.observes('machines')
        });
    }
);
