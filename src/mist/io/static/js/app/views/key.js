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
            templateName: 'key',
            key: null,
            machines: [],
            publicKey: null,
            privateKey: null,


            /**
             *
             *  Initialization
             *
             */

            load: function () {

                // Add event listeners
                Mist.keysController.on('onKeyListChange', this, 'updateView');
                Mist.keysController.on('onKeyDisassociate', this, 'updateMachines');
                Mist.cloudsController.on('onMachineListChange', this, 'updateMachines');

                Ember.run.next(this, this.updateView);

            }.on('didInsertElement'),


            unload: function () {

                // Remove event listeners
                Mist.keysController.off('onKeyListChange', this, 'updateView');
                Mist.keysController.off('onKeyDisassociate', this, 'updateMachines');
                Mist.cloudsController.off('onMachineListChange', this, 'updateMachines');

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
                    var newMachine = Mist.cloudsController.getMachine(machine[1], machine[0]);
                    if (!newMachine) {
                        var cloud = Mist.cloudsController.getCloud(machine[0]);
                        newMachine = Machine.create({
                            id: machine[1],
                            name: machine[1],
                            state: cloud ? 'terminated' : 'unknown',
                            cloud: cloud ? cloud : machine[0],
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
                        $('#single-key-machines').collapsible().enhanceWithin();
                });
            },


            showPublicKey: function () {
                var that = this;
                Mist.keysController.getPublicKey(this.key.id, function (success, publicKey) {
                    if (success && !that.isDestroyed)
                        that.set('publicKey', publicKey);
                });
            },


            /**
             *
             *  Actions
             *
             */

            actions: {

                displayClicked: function () {
                    var that = this;
                    Mist.keysController.getPrivateKey(this.key.id, function (success, privateKey) {
                        if (success) {
                            that.set('privateKey', privateKey);
                        }
                    });
                },


                renameClicked: function () {
                    var key = this.key;
                    Mist.keyEditController.open(key.id, function (success) {
                        if (success) {
                            Mist.__container__.lookup('router:main').transitionTo('key', Mist.keyEditController.newKeyId);
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
                                    Mist.__container__.lookup('router:main').transitionTo('keys');
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
