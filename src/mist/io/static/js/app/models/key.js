define('app/models/key', [
    'ember'
    ],
    /**
     * Key model
     *
     * @returns Class
     */
    function() {
        return Ember.Object.extend({
            name: null,
            pub: null,
            priv: null,
            machines: null,
            default_key: null,

            deleteKey: function() {
                payload = {'name': this.name}
                var that = this
                $.ajax({
                    url: 'keys/' + that.name,
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully deleted key ', that.name);
                        Mist.keysController.removeObject(that);
                        Ember.run.next(function(){$('#keys-list').listview('refresh')});
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting key'  +
                                that.name);
                        error(textstate, errorThrown, 'while deleting key', that.name);
                    }
                });
            },

            machineList: function() {
                //return a list with names of servers this key is associated to
                machineNames = [];
                this.machines.forEach(function(item){
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
                return machineNames;
            }.property('key'),

            setDefaultKey: function(){
                payload = {'name': this.name}
                var that = this
                $.ajax({
                    url: 'keys/' + that.name,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully set key ', that.name, ' as default');
                        var keys = new Array();
                        Mist.keysController.forEach(function(key){
                            key.set('default_key', false);
                        });
                        that.set('default_key', true);
                        Ember.run.next(function(){$('#keys-list').listview('refresh')});
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deafulting key'  +
                                that.name);
                        error(textstate, errorThrown, 'while defaulting key', that.name);
                    }
                });
            },
        });
    }
);
