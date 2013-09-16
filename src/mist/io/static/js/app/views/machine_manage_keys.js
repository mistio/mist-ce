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
            
            selectedKey: null,
            
            template: Ember.Handlebars.compile(machine_manage_keys_html),
            
            init: function() {
                this._super();
            },
            
            didInsertElement: function() {
                var machine = this.get('controller').get('model'), that=this;
                for (var i=0; i < machine.keys.content.length; i++){
                    for (var j=0; j<machine.keys.content[i].machines.length; j++){
                        var item = machine.keys.content[i].machines[j];
                        machine.keys.content[i].set('probed', null);
                        if (item[1] == machine.id && item[0] == machine.backend.id && item[2] > 0) {
                            machine.keys.content[i].set('probed', true);
                        } else if (item[1] == machine.id && item[0] == machine.backend.id && item[2] < 0){
                            machine.keys.content[i].set('probed', false);
                        }                        
                    }
                }
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
                var that = this;
                var machine = that.get('controller').get('model');
                if (machine.keys.content.length == 1 /*&& machine.keys.content[0] == that.selectedKey*/) {
                    Mist.confirmationController.set('title', 'Remove last key?');
                    Mist.confirmationController.set('text', 'WARNING! You are about to remove the last key associated with this machine.\
                                                             You will not be able to login through mist.io. Are you sure you want to do this?');
                    Mist.confirmationController.set('callback', function() {
                        $('#manage-keys .ajax-loader').fadeIn(200);
                        Mist.keysController.disassociateKey(that.selectedKey, machine);      
                    });
                    Mist.confirmationController.show();
                } else {
                    $('#manage-keys .ajax-loader').fadeIn(200);
                    Mist.keysController.disassociateKey(that.selectedKey, machine); 
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
            
            associateKeyClicked: function(key){
                $('#associate-key-dialog').popup('close');
                $('#manage-keys').panel('open');
                $('#manage-keys .ajax-loader').fadeIn(200);
                var machine = this.get('controller').get('model');
                Mist.keysController.associateKey(key.name, machine);
            },
            
            createKeyClicked: function() {
                $('#associate-key-dialog').popup('close');
                setTimeout(function(){
                        $('#create-key-dialog').popup('open', {transition: 'pop'});
                }, 350); 
            },

        });
    }
);
