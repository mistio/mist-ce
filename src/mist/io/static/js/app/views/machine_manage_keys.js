define('app/views/machine_manage_keys', [
    'app/models/machine',
    'text!app/templates/machine_manage_keys.html',
    'ember'],
    /**
     * Machine Manage Keys
     *
     * @returns Class
     */
    function(Machine, machine_manage_keys_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_manage_keys_html),

            selectedKey: null,
            parentMachine: null,
            associatedKeys: null,
            nonAssociatedKeys: null,

            keysObserver: function() {
                var newAssociatedKeys = new Array();
                var newNonAssociatedKeys = new Array();
                var machine = this.parentMachine;
                var found = false;
                Mist.keysController.keys.forEach(function(key) {
                    found = false;
                    key.machines.some(function(k_machine) {
                        if (machine.id == k_machine[1] && machine.backend.id == k_machine[0]) {
                            newAssociatedKeys.push(key);
                            found = true;
                            return true;
                        } 
                    });
                    if (!found) {
                        newNonAssociatedKeys.push(key);
                    }
                });
                this.set('associatedKeys', newAssociatedKeys);
                this.set('nonAssociatedKeys', newNonAssociatedKeys);
                this.parentMachine.set('keysCount', newAssociatedKeys.length);
                this.parentMachine.probedObserver();
                Ember.run.next(function() {
                    $('#associated-keys').listview();
                });
            }.observes('Mist.keysController.keys', 'Mist.keysController.keys.@each.machines',
                                                   'Mist.keysController.keys.@each.probeState'),

            didInsertElement: function() {
                this.set('parentMachine', this.get('controller').get('model'));
                var that = this;
                Ember.run.next(function() {
                    that.keysObserver();
                });
            },

            associateButtonClicked: function() {
                $('#non-associated-keys').listview('refresh');
                $('#associate-key-dialog').popup('option', 'positionTo', '#associate-key-button').popup('open');
            },

            backClicked: function() {
                $('#manage-keys').panel("close");
            },

            actionRemoveClicked: function() {
                $('#key-actions').popup('close');
                if (this.associatedKeys.length == 1) {
                    var that = this;
                    Mist.confirmationController.set('title', 'Remove last key?');
                    Mist.confirmationController.set('text', 'WARNING! You are about to remove the last key associated with this machine.\
                                                             You will not be able to login through mist.io. Are you sure you want to do this?');
                    Mist.confirmationController.set('callback', function() {
                        $('#manage-keys .ajax-loader').fadeIn(200);
                        Mist.keysController.disassociateKey(that.selectedKey.name, that.parentMachine);      
                    });
                    Mist.confirmationController.show();
                } else {
                    $('#manage-keys .ajax-loader').fadeIn(200);
                    Mist.keysController.disassociateKey(this.selectedKey.name, this.parentMachine); 
                }         
            },

            actionProbeClicked: function() {
                $('#key-actions').popup('close');
                this.parentMachine.probe(this.selectedKey.name);
            },

            actionBackClicked: function() {
                $('#key-actions').popup('close');
            },

            associateKeyClicked: function(key) {
                $('#associate-key-dialog').popup('close');
                $('#manage-keys').panel('open');
                $('#manage-keys .ajax-loader').fadeIn(200);
                Mist.keysController.associateKey(key.name, this.parentMachine);
            },

            createKeyClicked: function() {
                $('#associate-key-dialog').popup('close');
                var that = this;
                Ember.run.next(function() {
                    $('#create-key-dialog').popup('open');
                    Mist.keyAddController.set('associateMachine', that.parentMachine);
                });
            },
        });
    }
);
