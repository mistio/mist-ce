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
                history.back();
            },

            associateKeys: function() {
                var selectedMachines = this.getSelectedMachines();
                var machines = []; 
                selectedMachines.forEach(function(machine){
                    machines.push([machine.backend.id, machine.id]);
                });
                Mist.keysController.associateKey(Mist.key.name,machines);
                history.back();
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

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(key_associate_dialog_html));
            },
        });
    }
);
