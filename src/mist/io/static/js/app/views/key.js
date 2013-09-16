define('app/views/key', [
    'app/models/machine',
    'app/views/mistscreen',
    'text!app/templates/key.html',
    'ember'
    ],
    /**
     *
     * Single Key View
     *
     * @returns Class
     */
    function(Machine, MistScreen, key_html) {
        return MistScreen.extend({
            
            associatedMachines: null,
            
            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(key_html));
                var that=this;
                Ember.run.next(function(){
                    that.machinesObserver();
                });
            },

            machinesObserver: function() {
        	    var key = this.get('controller').get('model');
                machineList = new Array();
                if (key.machines) {
                    key.machines.forEach(function(key_machine) {
                        var machine = Mist.backendsController.getMachineById(key_machine[0], key_machine[1]);
                        if (machine) {
                            machineList.push(machine);
                        } else {
                            var backend = Mist.backendsController.getBackendById(key_machine[0]);
                            var state = 'unknown';
                            if (backend) {
                                state = 'terminated';
                            }
                            var item = {id: key_machine[0],
                                        name: key_machine[0],
                                        backend: backend,
                                        state: state,
                                        isGhost: true};
                            machineList.push(Machine.create(item)); 
                        }
                    });
                }
                this.set('associatedMachines', machineList);
            }.observes('controller.model.machines'),
            
            editClicked: function() {
                var key = this.get('controller').get('model');
                Mist.keysController.getPrivKey(key.name, "#textarea-private-key");
                $("#textarea-public-key").val(key.pub).trigger('change');
                $("#create-key-name").val(key.name).trigger('change');
                $("#dialog-add-key").popup("open", {transition: 'pop'});
            },

            deleteClicked: function() {
                var key = this.get('controller').get('model');
                Mist.confirmationController.set('title', 'Delete key');
                Mist.confirmationController.set('text', 'Are you sure you want to delete ' + key.name +'?');
                Mist.confirmationController.set('callback', function() {
                    Mist.keysController.deleteKey(key.name);                
                });
                Mist.confirmationController.set('fromDialog', true);
                Mist.confirmationController.show();
            },

            displayPrivateClicked: function(){
                var key = this.get('controller').get('model');
                Mist.keysController.getPrivKey(key.name, "#private-key");
                $("#key-private-dialog").popup("open", {transition: 'pop'});
            },
        });
    }
);
