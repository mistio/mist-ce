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
            
            init: function() {
                this._super();
            },
            
            selectKey: function(key){
                $('#associate-key-dialog').popup('close');
                $('#manage-keys .ajax-loader').fadeIn(200);
                $('#manage-keys').panel('open');
                var machine = this.get('controller').get('model');
                Mist.keysController.associateKey(key.name, machine);
            },
            
            cancelManageKeysClicked: function() {
                $('#manage-keys').panel("close");
            },
            
            associateClicked: function() {
                $('#manage-keys').panel('close');
                $('#associate-key-dialog').popup('open', {transition: 'pop'});
                $('#non-associated-keys').listview('refresh');
            },
            
            disassociateClicked: function(key) {
                $('#manage-keys .ajax-loader').fadeIn(200);
                var machine = this.get('controller').get('model');
                Mist.keysController.disassociateKey(key, machine);
            },
            
            createKeyClicked: function() {
                $('#associate-key-dialog').popup('close');
                // JQM won't open second popup imediately
                setTimeout( function(){
                        $('#dialog-add-key').popup('open', {transition: 'pop'});
                    }, 
                    350); 
            },
            
            cancelAssociateClicked: function() {
                $('#associate-key-dialog').popup('close');
                $('#manage-keys').panel('open');
            }
      
        });
    }
);