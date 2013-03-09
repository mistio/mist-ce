define('app/controllers/keys', [
    'app/models/key',
    'ember',
    'jquery'
    ],
    /**
     * Keys controller
     *
     *
     * @returns Class
     */
    function(Key) {
        return Ember.ArrayController.extend({

            keyCount: 0,

            init: function() {
                this._super();

                var that = this;

                $.getJSON('/keys', function(data) {
                    var content = new Array();
                    data.forEach(function(item){
                        content.push(Key.create(item));
                    });
                    that.set('content', content);
                }).error(function() {
                    Mist.notificationController.notify("Error loading keys");
                });
            },

            newKey: function(name, publicKey, privateKey) {
                item = {
                    'name':name,
                    'pub': publicKey,
                    'priv': privateKey
                }

                var that = this;
                $.ajax({
                    url: 'keys/' + name,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function(data) {
                        info('Successfully sent create key ', name);
                        // don't keep private key on the client
                        item.priv = null;
                        var key = Key.create(data);
                        that.addObject(key);
                        Ember.run.next(function(){
                            $('#keys-list').listview('refresh');
                            $('#keys-list input.ember-checkbox').checkboxradio();  
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while sending create key'  +
                                name);
                        error(textstate, errorThrown, 'while creating key', name);
                    }
                });
            },

            getPrivKey: function(name) {
                payload = {'key_name': name}
                var that = this
                $.ajax({
                    url: 'keys/private/key',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully got private key ', name);
                        $("#private-key").val(data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while getting key'  +
                                name);
                        error(textstate, errorThrown, 'while getting key', name);
                    }
                });
            },

            associateKey: function(key_name, machines) {
                payload = {'key_name': key_name, 'machine_backend_list': machines}
                var that = this
                $.ajax({
                    url: 'keys/associate',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully associated key ', key_name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while associating key'  +
                                key_name);
                        error(textstate, errorThrown, 'while associating key', key_name);
                    }
                });
            }

        });
    }
);
