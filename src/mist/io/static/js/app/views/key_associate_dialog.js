define('app/views/key_associate_dialog', [
    'text!app/templates/key_associate_dialog.html','ember'],
    /**
     *
     * Associate Key dialog
     *
     * @returns Class
     */
    function(key_associate_dialog_html) {
        return Ember.View.extend({
            tagName: false,

            back: function() {
                $('#key-associate-dialog').popup('close');
            },

            associateKeys: function() {
            	var key = this.get('controller').get('model');
                var selectedMachines = this.getSelectedMachines();
                var machines = []; 
                selectedMachines.forEach(function(machine){
                    machines.push([machine.backend.id, machine.id]);
                });
                Mist.keysController.associateKeys(key,machines);
            	$('#key-associate-dialog').popup('close');
            },

            getSelectedMachines: function() {
                var machines = new Array();

                Mist.backendsController.forEach(function(backend){
                    backend.machines.forEach(function(machine){
                        if(machine.selected){
                            machines.push(machine);
                        }
                    });
                });
                return machines;
            },

            template: Ember.Handlebars.compile(key_associate_dialog_html),
        });
    }
);
