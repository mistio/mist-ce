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
                $('#key-actions').popup('open', {transition: 'pop'});
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
                // TODO: Upload a private key and add it to selectedKey
                alert('Uploading private key for ' + this.selectedKey.name );  
            },
            
            actionProbeClicked: function() {
                // TODO: Do something in here...
                alert('Probing...');
            },
            
            actionBackClicked: function() {
                $('#key-actions').popup('close');
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
