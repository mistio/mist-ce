define('app/views/machine_manage_keys', [
    'app/models/machine',
    'text!app/templates/machine_manage_keys.html',
    'ember'],
    /**
     *
     * Machine Manage Keys
     *
     * @returns Class
     */
    function(Machine, machine_manage_keys_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_manage_keys_html),

            selectedKey: null,
            associatedKeys: null,
            nonAssociatedKeys: null,
            parentMachine: null,

            keysObserver: function() {
                var aKeys = new Array();
                var naKeys = new Array();
                var machine = this.parentMachine;
                var found = false;
                Mist.keysController.keys.forEach(function(key) {
                    found = false;
                    if (key.machines) {
                        for (var m = 0; m < key.machines.length; ++m) {
                            k_machine = key.machines[m];
                            if (machine.id == k_machine[1] && machine.backend.id == k_machine[0]) {
                                if (k_machine[2] > 0) {
                                    key.set('probeState', 'probed');
                                } else {
                                    key.set('probeState', 'unprobed');
                                }
                                aKeys.push(key);
                                found = true;
                                break;
                            } 
                        }
                    }
                    if (!found) {
                        naKeys.push(key);
                    }
                });
                this.set('associatedKeys', aKeys);
                this.set('nonAssociatedKeys', naKeys);
                this.parentMachine.set('keysCount', aKeys.length);
                this.parentMachine.set('probed', aKeys.length ? true : false);
                this.parentMachine.probedObserver();
                Ember.run.next(function() {
                    $('#associated-keys').listview();
                });
            }.observes('Mist.keysController.keys', 'Mist.keysController.keys.@each.machines',
                                                   'Mist.keysController.keys.@each.probeState'),

            didInsertElement: function() {
                var that = this;
                that.set('parentMachine', that.get('controller').get('model'));
                Ember.run.next(function() {
                    that.keysObserver();
                });
            },

            associatedKeyClicked: function(key) {
                this.selectedKey = key;
                if (key.priv) {
                    $('#key-action-upload').parent().css('display', 'none');
                    $('#key-action-probe').parent().css('display', 'block');
                } else {
                    $('#key-action-upload').parent().css('display', 'block');
                    $('#key-action-probe').parent().css('display', 'none'); 
                }
                $('#non-associated-keys').listview('refresh');
                $('#key-actions').popup('option', 'positionTo', '#associated-keys').popup('open');
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
                var machine = this.parentMachine;
                if (this.associatedKeys.length == 1) {
                    var that = this;
                    Mist.confirmationController.set('title', 'Remove last key?');
                    Mist.confirmationController.set('text', 'WARNING! You are about to remove the last key associated with this machine.\
                                                             You will not be able to login through mist.io. Are you sure you want to do this?');
                    Mist.confirmationController.set('callback', function() {
                        $('#manage-keys .ajax-loader').fadeIn(200);
                        Mist.keysController.disassociateKey(that.selectedKey.name, machine);      
                    });
                    Mist.confirmationController.show();
                } else {
                    $('#manage-keys .ajax-loader').fadeIn(200);
                    Mist.keysController.disassociateKey(this.selectedKey.name, machine); 
                }         
            },
            
            actionUploadClicked: function() {
                if (window.File && window.FileReader && window.FileList) {
                    $("#key-action-upload-key").click();
                } else {
                    alert('The File APIs are not fully supported in this browser.');
                }
            },
            
            actionProbeClicked: function() {
                $('#key-actions').popup('close');
                this.get('controller').get('model').probe(this.selectedKey.name);
            },
            
            actionBackClicked: function() {
                $('#key-actions').popup('close');
            },
            
            uploadInputChanged: function() {
                $('#manage-keys .ajax-loader').fadeIn(200);
                var reader = new FileReader();
                var key = this.selectedKey;
                reader.onloadend = function(evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        $('#key-actions').popup('close');
                        Mist.keysController.editKey(key.name,
                                                     key.name,
                                                     key.pub,
                                                     evt.target.result);
                    }
               };
               reader.readAsText($('#key-action-upload-key')[0].files[0], 'UTF-8');  
            },
            
            associateKeyClicked: function(key) {
                $('#associate-key-dialog').popup('close');
                $('#manage-keys').panel('open');
                $('#manage-keys .ajax-loader').fadeIn(200);
                var machine = this.get('controller').get('model');
                Mist.keysController.associateKey(key.name, machine);
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
