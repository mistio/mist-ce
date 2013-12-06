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
            machines: null,
            template: Ember.Handlebars.compile(key_html),

            /**
             * 
             *  Initialization
             * 
             */

            init: function() {
                this._super();
                var that = this;
                Mist.keysController.one('load', function() {
                    that.renderPage();
                });
                Mist.backendsController.on('updateMachines', function() {
                    that.renderMachines();
                });
            },


            renderPage: function() {

                // Prevent bad collapsible rendering
                $('#single-key-machines').hide();

                // Get key model
                var key = Mist.keysController.getRequestedKey();
                if (key) {
                    this.get('controller').set('model', key);
                }
                this.set('key', this.get('controller').get('model'));

                // Render stuff
                if (this.key.id) { // Dummy key doesn't have id
                    Ember.run.next(this, function() {
                        Mist.keysController.getPublicKey(this.key.name, function(publicKey) {
                             $('#public-key').val(publicKey);
                        });
                    });
                    this.renderMachines();
                }
            }.observes('controller.model').on('didInsertElement'),



            /**
             * 
             *  Methods
             * 
             */

            renderMachines: function() {

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

                Ember.run(this, function() {
                this.set('machines', machineList);

                Ember.run.next(function() {
                    if ($('#single-key-machines').collapsible) {
                        $('#single-key-machines').collapsible();
                        $('#single-key-machines').trigger('create');
                    }
                    if ($('#single-key-machines .ui-listview').listview) {
                        $('#single-key-machines .ui-listview').listview('refresh');
                    }
                    if ($('#single-key-machines input.ember-checkbox').checkboxradio) {
                        $('#single-key-machines input.ember-checkbox').checkboxradio();
                    }
                    $('#single-key-machines').show();
                });
                });
            },



            /**
             * 
             *  Actions
             * 
             */

            actions: {

                displayClicked: function() {
                    Mist.keysController.getPrivateKey(this.key.name, function(privateKey) {
                        $('#private-key-popup').popup('open');
                        $('#private-key').val(privateKey);
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
                    var keyName = this.key.name;
                    Mist.confirmationController.set('title', 'Delete key');
                    Mist.confirmationController.set('text', 'Are you sure you want to delete "' + keyName + '" ?');
                    Mist.confirmationController.set('callback', function() {
                        Mist.Router.router.transitionTo('keys');
                        Mist.keysController.deleteKey(keyName);
                    });
                    Mist.confirmationController.show();
                }
            }
        });
    }
);
