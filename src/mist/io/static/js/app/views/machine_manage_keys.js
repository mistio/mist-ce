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
                //$('.select-key-collapsible').collapsible('option','collapsedIcon','check');    
                $('.select-key-collapsible').trigger('collapse');
                var machine = this.get('controller').get('model');
                $('#manage-keys .ajax-loader').fadeIn(200);
                Mist.keysController.associateKey(key.name, machine);    
            },
            
            cancelManageKeysClicked: function() {
                $('#manage-keys').panel("close");
            },
            
            disassociateClick: function(key) {
                var machine = this.get('controller').get('model');
                $('#manage-keys .ajax-loader').fadeIn(200);
                Mist.keysController.disassociateKey(key, machine);
            },
            
            createKeyClicked: function() {
                $('#manage-keys').panel('close');
                $('#dialog-add-key').popup('open', {transition: 'pop'});
            }
      
        });
    }
);