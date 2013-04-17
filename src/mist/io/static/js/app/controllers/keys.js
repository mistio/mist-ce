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

                that.addObserver('length', function() {
                    that.getSelectedKeyCount();
                });

                $.getJSON('/keys', function(data) {
                    that.updateKeyList(data);
                }).error(function() {
                    Mist.notificationController.notify("Error loading keys");
                });
            },

            newKey: function(name, publicKey, privateKey) {
                item = {
                    'name': name,
                    'pub': publicKey,
                    'priv': privateKey
                }

                var that = this;
                $.ajax({
                    url: '/keys/' + name,
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
                            key.addObserver('selected', function() {
                                that.getSelectedKeyCount();
                            });
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

            getPrivKey: function(key) {
                payload = {
                    'action': 'get_private_key',
                    'key_id': key.name
                };
                var that = this;
                $.ajax({
                    url: '/keys/' + key.name,
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

            associateKeys: function(key, machines) {
                payload = {'key_id': key.name, 'machine_backend_list': machines}
                var that = this
                $.ajax({
                    url: 'keys/associate/machines',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully associated key ', key.name);
                        key.set('machines', machines);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while associating key'  +
                                key.name);
                        error(textstate, errorThrown, 'while associating key', key.name);
                    }
                });
            },

            associateKey: function(key_name, machine) {
                payload = {
                    'action': 'associate',
                    'key_id': key_name,
                    'backend_id': machine.backend.id,
                    'machine_id': machine.id
                }

                var key = this.getKeyByName(key_name);
                $.ajax({
                    url: '/keys/' + key_name,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully associated key ', key_name);
                        machine.keys.addObject(key);
                        Ember.run.next(function(){
                            $('.delete-key-button').button();
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while associating key'  +
                                key_name);
                        error(textstate, errorThrown, 'while associating key', key_name);
                    }
                });
            },

            getKeyByName: function(key_name) {
                var ret;
                this.forEach(function(key){
                    if (key.name == key_name) {
                        ret = key;
                    }
                });
                return ret;
            },

            disassociateKey: function(key, machine) {
                payload = {
                    'action': 'disassociate',
                    'key_id': key.name,
                    'backend_id': machine.backend.id,
                    'machine_id': machine.id
                }

                $.ajax({
                    url: '/keys/' + key.name,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully disassociated key ', key.name);
                        machine.keys.removeObject(key);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while disassociating key'  +
                                key.name);
                        error(textstate, errorThrown, 'while disassociating key', key.name);
                    }
                });
            },

            getSelectedKeyCount: function() {
                var count = 0;
                this.content.forEach(function(item){
                    if (item.selected == true){
                        count+=1;
                    }
                });
                this.set('selectedKeyCount', count);
            },

            updateKeyList: function(data) {
                var content = new Array();
                data.forEach(function(item){
                    content.push(Key.create(item));
                });
                this.set('content', content);

                var that = this;
                Ember.run.next(function(){
                    Mist.keysController.forEach(function(item){
                        item.addObserver('selected', function() {
                            that.getSelectedKeyCount();
                        });
                    });
                });
            }
        });
    }
);
