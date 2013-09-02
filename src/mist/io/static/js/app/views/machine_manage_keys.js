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
            
            associatedKeyClicked: function(key) {
                this.selectedKey = key;
                Mist.keysController.getPrivKey(key, "#key-action-textarea");
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
                $('#manage-keys .ajax-loader').fadeIn(200);
                var machine = this.get('controller').get('model');
                Mist.keysController.disassociateKey(this.selectedKey, machine);
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
                        $('#dialog-add-key').popup('open', {transition: 'pop'});
                }, 350); 
            },

        });
    }
);
