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
    
            keys: null,
            loadingKeys: null,
            
            init: function() {
                this._super();
                this.loadKeys();
            },
            
            selectedKeysObserver: function() {
                var selectedKeysCount = 0;
                this.keys.forEach(function(key){
                    if (key.selected) {
                        selectedKeysCount++;
                    }
                });
                // TODO: Transfer this code to KeyListView
                if (selectedKeysCount == 1) {
                    $('#keys-footer').fadeIn(200);
                } else {
                    $('#keys-footer').fadeOut(200);
                }
            }.observes('keys.@each.selected'),
            
            loadKeys: function() {
                this.set('loadingKeys', true);
                var that = this;
                $.getJSON('/keys', function(data) {
                    info('Successfully loaded keys');
                    that.set('loadingKeys', false);
                    that.updateKeyList(data);
                }).error(function(jqXHR, textStatus, errorThrown) {
                    that.set('loadingKeys', false);
                    Mist.notificationController.notify('Error while loading key: ' + jqXHR.responseText);
                    error(textstate, errorThrown, ', while loading keys');
                });
            },

            newKey: function(name, publicKey, privateKey) {
                item = {
                    'name': name,
                    'pub': publicKey,
                    'priv': privateKey
                };
                var that = this;
                $.ajax({
                    url: '/keys/' + name,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function(data) {
                        info('Successfully created key : ', name);
                        item.priv = null; // don't keep private key on the client
                        var key = Key.create(data);
                        that.keys.addObject(key);
                        Ember.run.next(function(){
                            $('#keys-list').listview('refresh');
                            $('#keys-list input.ember-checkbox').checkboxradio();
                            $("#dialog-add-key").popup("close");
                            Mist.keyAddController.newKeyClear();
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while creating new key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while creating key: ', name);
                    }
                });
            },
            
            editKey: function(oldName, name, publicKey, privateKey) {  
                item = {
                    'oldname': oldName,
                    'name': name,
                    'pub': publicKey,
                    'priv': privateKey
                };
                var that = this;
                $.ajax({
                    url: '/keys/' + name,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function(data) {
                        info('Successfully edited key: ', name);
                        item.priv = null; // don't keep private key on the client
                        var key = that.getKeyByName(oldName);
                        key.set('name', name);
                        key.set('pub', publicKey);
                        Ember.run.next(function(){
                            $('#keys-list').listview('refresh');
                            $("#dialog-add-key").popup("close");
                            Mist.keyAddController.newKeyClear();
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while editting key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while editting key: ', name);
                    }
                });
            },
            
            deleteKey: function(name) {
                payload = {
                    'key_id': name,
                };
                var name = name;
                var that = this;
                $.ajax({
                    url: 'keys/' + that.name,
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully deleted key: ', name);
                        Mist.keysController.updateKeyList(data);
                        Ember.run.next(function() {
                            $('#keys-list').listview('refresh');
                            $('#keys-list .ember-checkbox').checkboxradio();
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while deleting key: ', name);
                    }
                });
            },
            
            setDefaultKey: function(name){
                payload = {
                    'action': 'set_default',
                    'key_id': name,
                };
                var that = this;
                var name = name;
                $.ajax({
                    url: '/keys',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully set default key: ', name);
                        Mist.keysController.keys.forEach(function(key){
                            if (key.name == name) {
                                key.set('default_key', true);
                            } else {
                                key.set('default_key', false);
                            }
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while setting default key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while setting default key: ', name);
                    }
                });
            },

            associateKey: function(key_name, machine) {
                payload = {
                    'action': 'associate',
                    'key_id': key_name,
                    'backend_id': machine.backend.id,
                    'machine_id': machine.id,
                    'host': machine.getHost()
                };
                var machine = machine;
                var key = this.getKeyByName(key_name);
                $.ajax({
                    url: '/keys/' + key_name,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        info('Successfully associated key: ' + key_name + ' with machine: ' + machine.id);
                        Ember.run.next(function(){
                            try {
                                $('#associated-keys').listview('refresh');
                                $('.key-icon-wrapper').trigger('create');
                                $('#associated-keys').parent().trigger('create');
                            } catch (e) {}
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.notificationController.notify('Error while associating key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while associating key', key_name);
                    }
                });
            },
            
            disassociateKey: function(key, machine) {
                payload = {
                    'action': 'disassociate',
                    'key_id': key.name,
                    'backend_id': machine.backend.id,
                    'machine_id': machine.id,
                    'host': machine.getHost()
                };
                $.ajax({
                    url: '/keys/' + key.name,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully disassociated key: ', key.name);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Ember.run.next(function(){
                            $('.key-icon-wrapper').trigger('create');
                            $('#associated-keys').listview('refresh');
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.notificationController.notify('Error while disassociating key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ', while disassociating key', key_name);
                    }
                });
            },
            
            getPrivKey: function(key, element) {
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
                        info('Successfully got private key: ' + name);
                        $(element).val(data).trigger('change');
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while getting key: ' + name);
                        error(textstate, errorThrown, ', while getting key', name);
                    }
                });
            },

            getKeyByName: function(key_name) {
                for (var i = 0; i < this.keys.length; ++i) {
                    if (this.keys[i].name == key_name) {
                        return this.keys[i];
                    }
                }
            },

            updateKeyList: function(data) {
                var keys = new Array();
                data.forEach(function(key) {
                    keys.push(Key.create(key));
                });
                this.set('keys', keys);
            }
        });
    }
);
