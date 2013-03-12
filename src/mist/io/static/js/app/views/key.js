define('app/views/key', [
    'text!app/templates/key.html',
    'ember'
    ],
    /**
     *
     * Key page
     *
     * @returns Class
     */
    function(key_html) {
        return Ember.View.extend({
            tagName: false,
            keyBinding: 'Mist.key',

            disabledAssociateClass: function() {
                var count = 0
                Mist.backendsController.content.forEach(function(item){
                    count = count + item.machines.content.length;
                });
                if (count == 0) {
                    return 'ui-disabled';
                } else {
                    return '';
                }
            }.property('key'),

            keyMachines: function() {
                var key = this.key;
                machineNames = [];
                if (key) {
                    key.machines.forEach(function(item){
                        Mist.backendsController.content.forEach(function(backend){
                            backend.machines.content.forEach(function(machine){
                                if (machine.id == item[1]) {
                                    machineNames.push(machine.name);
                                }
                            });
                        });
                    });
                }
                return machineNames;
            }.property('key.machines'),

            associateKey: function() {
                $.mobile.changePage('#key-associate-dialog');
                //check boxes for machines associated with this key
                $('li').find("input[type='checkbox']").attr("checked",false).checkboxradio("refresh");
                Mist.key.machines.forEach(function(item){
                    info(item[1]);
                    $('li.'+item[1]).find("input[type='checkbox']").attr("checked",true).checkboxradio("refresh");
                    Mist.backendsController.content.forEach(function(backend){
                        backend.machines.content.forEach(function(machine){
                            if (machine.id == item[1]) {
                                machine.set("selected",true);
                            }
                        });
                    });
                });
            },

            deleteKey: function() {
                var key = this.key;
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
                if (key.machines.length > 0) {
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
                    $.mobile.changePage('#keys');
                });
                Mist.confirmationController.set('fromDialog', true);

                Mist.confirmationController.show();
            },

            displayPrivate: function(){
                var key = this.key;
                Mist.keysController.getPrivKey(key.name);
                $.mobile.changePage('#key-private-dialog');
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(key_html));
                $('.public-key input, .private-key input').live('click', function(){
                    this.select();
                });
                $('.public-key input, .private-key input').live('change', function(){
                   return false;
                });
            },
        });
    }
);
