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

            id: function() {
               return this.name;
            }.property("name"),

            deleteKey: function() {
                payload = {
                    'key_id': this.name
                }
                var that = this
                $.ajax({
                    url: 'keys/' + that.name,
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully deleted key', that.name);
                        Mist.keysController.updateKeyList(data);
                        Ember.run.next(function() {
                            $('#keys-list').listview('refresh');
                            $('#keys-list .ember-checkbox').checkboxradio();
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting key '  +
                                that.name);
                        error(textstate, errorThrown, 'while deleting key', that.name);
                    }
                });
            },

            setDefaultKey: function(){
                payload = {
                    'action': 'set_default',
                    'key_id': this.name,
                }
                var that = this
                $.ajax({
                    url: '/keys',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully set key', that.name, 'as default');
                        Mist.keysController.forEach(function(key){
                            key.set('default_key', false);
                        });
                        that.set('default_key', true);
                        Ember.run.next(function(){$('#keys-list').listview('refresh')});
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while setting key '  +
                                that.name + ' as default');
                        error(textstate, errorThrown, 'while setting default key', that.name);
                    }
                });
            },
        });
    }
);
