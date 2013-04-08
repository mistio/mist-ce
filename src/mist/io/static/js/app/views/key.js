define('app/views/key', [
    'app/views/mistscreen',
    'text!app/templates/key.html',
    'ember'
    ],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(MistScreen, key_html) {
        return MistScreen.extend({

            disabledAssociateClass: function() {
                /*
                var count = 0
                Mist.backendsController.content.forEach(function(item){
                    count = count + item.machines.content.length;
                });
                if (count == 0) {
                    return 'ui-disabled';
                } else {
                    return '';
                }
                */
                return 'ui-disabled';
            }.property('Mist.backendsController.machineCount'),

            keyMachines: function() {

        	    var key = this.get('controller').get('model');

                machineList = [];
                if (key && key.machines && key.machines.forEach) {
                    key.machines.forEach(function(item){
                        Mist.backendsController.content.forEach(function(backend){
                            backend.machines.content.forEach(function(machine){
                                if (machine.id == item[1]) {
                                    machineList.push(machine);
                                }
                            });
                        });
                    });
                }
                return machineList;
            }.property('key.machines'),

            associateKey: function() {
        	    var key = this.get('controller').get('model');
        	    $("#key-associate-dialog").popup("open", {transition: 'pop'});
                //check boxes for machines associated with this key
                if (key && key.machines) {
                    key.machines.forEach(function(item){
                        Ember.run.next(function(){
                            $("#key-machines-list").find("input[type='checkbox']").checkboxradio("refresh");
                        });
                        Mist.backendsController.content.forEach(function(backend){
                            backend.machines.content.forEach(function(machine){
                                if (machine.id == item[1]) {
                                    machine.set("selected",true);
                                }
                            });
                        });
                    });
                }
            },

            deleteKey: function() {
                var key = this.get('controller').get('model');
                if (key.machines) {
                    machineNames = [];
                    key.machines.forEach(function(item){
                        Mist.backendsController.content.forEach(function(backend){
                            if (backend.id == item[0]) {
                                backend.machines.content.forEach(function(machine){
                                    if (machine.id == item[1]) {
                                        machineNames.push(machine.name);
                                    }
                                });
                            }
                        });
                    });
                }

                Mist.confirmationController.set('title', 'Delete Key: ' + key.name);
                if (key.machines && key.machines.length > 0) {
                Mist.confirmationController.set('text', 'Your key is associated with ' + machineNames.toString() +'. Are you sure you want to delete ' +  key.name + '? You will not be able use console and monitoring on these VMs.');
                } else {
                    Mist.confirmationController.set('text', 'Are you sure you want to delete ' +
                                                key.name + '?');
                }
                Mist.confirmationController.set('callback', function() {
                    key.deleteKey();
                    key.machines.forEach(function(item){
                        Mist.backendsController.content.forEach(function(backend){
                            if (backend.id == item[0]) {
                                backend.machines.content.forEach(function(machine){
                                    if (machine.id == item[1]) {
                                        machine.set("hasKey", false);
                                    }
                                });
                            }
                        });
                    });
                    Mist.Router.router.transitionTo('keys');
                });
                Mist.confirmationController.set('fromDialog', true);

                Mist.confirmationController.show();
            },

            displayPrivate: function(){
                var key = this.get('controller').get('model');
                Mist.keysController.getPrivKey(key);
                $("#key-private-dialog").popup("open", {transition: 'pop'});
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(key_html));
                $('.public-key input').on('click', function(){
                    this.select();
                });
                $('.public-key input').on('change', function(){
                   return false;
                });
            },
        });
    }
);
