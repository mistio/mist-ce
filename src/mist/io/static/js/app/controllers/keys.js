define('app/controllers/keys', [
    'app/models/key',
    'ember',
    'jquery'
    ],
    /**
     * Keys controller
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

            loadKeys: function() {
                this.set('loadingKeys', true);
                var that = this;
                $.ajax({
                    url: '/keys',
                    type: 'GET',
                    success: function(data) {
                        info('Successfully loaded keys');
                        that.set('loadingKeys', false);
                        that.updateKeyList(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        Mist.notificationController.notify('Error while loading key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while loading keys. ', jqXHR.responseText);
                        that.set('loadingKeys', false);
                    }
                });
            },

            newKey: function(name, publicKey, privateKey, machine, autoSelect) {
                name = name.trim();
                item = {
                    'name': name,
                    'pub': publicKey,
                    'priv': privateKey
                };
                var that = this;
                $.ajax({
                    url: '/keys',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function(data) {
                        info('Successfully created key : ', name);
                        item.priv = null; // don't keep private key on the client
                        $("#create-key-dialog").popup("close");
                        Mist.keyAddController.newKeyClear();
                        if (autoSelect) {
                            that.keys.addObject(Key.create(data));
                            Ember.run.next(function(){
                                $('.select-key-collapsible .select-listmenu').listview();
                                $('.select-key-collapsible').parent().trigger('create');
                                $('.select-key-collapsible li a').eq(0).click();
                                $('.select-key-collapsible').removeClass('ui-disabled');
                            });
                        } else {
                            $('#keys-list').fadeOut(200);
                            Ember.run.later(function() {
                                that.keys.addObject(Key.create(data));
                                Ember.run.next(function() {
                                    $('#keys-list').listview('refresh');
                                    $('#keys-list input.ember-checkbox').checkboxradio();
                                    $('#keys-list').fadeIn(200);
                                });
                            }, 200);
                        }
                        if (machine) {
                            that.associateKey(name, machine);
                            $('#manage-keys .ajax-loader').fadeIn(200);
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while creating new key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while creating key: ', name, '. ', jqXHR.responseText);
                    }
                });
            },

            deleteKey: function(name) {
                $.ajax({
                    url: '/keys/' + name,
                    type: 'DELETE',
                    success: function(data) {
                        info('Successfully deleted key: ', name);
                        Mist.keysController.updateKeyList(data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while deleting key: ', name, '. ', jqXHR.responseText);
                    }
                });
            },

            editKey: function(oldName, name, publicKey, privateKey) {
                name = name.trim();
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
                    success: function() {
                        info('Successfully edited key: ', name);
                        item.priv = null; // don't keep private key on the client
                        var key = that.getKeyByName(oldName);
                        key.set('name', name);
                        key.set('pub', publicKey);
                        Ember.run.next(function() {
                            $("#create-key-dialog").popup("close");
                            Mist.keyAddController.newKeyClear();
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while editting key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while editting key: ', name, '. ', jqXHR.responseText);
                    }
                });
            },

            setDefaultKey: function(name) {
                $.ajax({
                    url: '/keys/' + name,
                    type: 'POST',
                    success: function() {
                        info('Successfully set default key: ', name);
                        Mist.keysController.keys.forEach(function(key) {
                            if (key.name == name) {
                                key.set('default_key', true);
                            } else {
                                key.set('default_key', false);
                            }
                        });
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while setting default key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while setting default key: ', name, ', ', jqXHR.responseText);
                    }
                });
            },

            associateKey: function(keyName, machine) {
                payload = {
                    'key_id': keyName,
                    'backend_id': machine.backend.id,
                    'machine_id': machine.id,
                    'host': machine.getHost()
                };
                $.ajax({
                    url: '/backends/' + machine.backend.id + '/machines/' + machine.id + '/keys/' + keyName,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully associated key: ', keyName, ' with machine: ', machine.id);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.keysController.updateKeyMachineList(keyName, data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while associating key: ' + keyName);
                        error(textstate, errorThrown, ' while associating key', keyName, '. ', jqXHR.responseText);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                    }
                });
            },

            disassociateKey: function(keyName, machine) {
                payload = {
                    'key_id': keyName,
                    'backend_id': machine.isGhost ? machine.bakend : machine.backend.id,
                    'machine_id': machine.id,
                    'host': machine.isGhost ? null : machine.getHost(),
                };
                $.ajax({
                    url: '/backends/' + machine.backend.id + '/machines/' + machine.id + '/keys/' + keyName,
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully disassociated key: ', keyName, ' with machine: ', machine.id);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.keysController.updateKeyMachineList(keyName, data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while disassociating key: ' + keyName);
                        error(textstate, errorThrown, ' while disassociating key ', keyName, '. ', jqXHR.responseText);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                    }
                });
            },

            getPrivKey: function(keyName, element) {
                $.ajax({
                    url: '/keys/' + keyName,
                    type: 'GET',
                    success: function(data) {
                        info('Successfully got private key: ' + keyName);
                        $(element).val(data).trigger('change');
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while getting private key: ' + keyName);
                        error(textstate, errorThrown, ' while getting private key. ', jqXHR.responseText);
                    }
                });
            },

            getKeyByName: function(keyName) {
                for (var k = 0; k < this.keys.length; ++k) {
                    if (this.keys[k].name == keyName) {
                        return this.keys[k];
                    }
                }
                return null;
            },

            updateKeyList: function(data) {
                $('#keys-list').fadeOut(200);
                
                var keys = new Array();
                data.forEach(function(key) {
                    keys.push(Key.create(key));
                });
                
                var that = this;
                Ember.run.later(function(){
                    that.set('keys', keys);
                    Ember.run.next(function(){
                        $('#keys-list').listview('refresh');
                        $('#keys-list input.ember-checkbox').checkboxradio();
                        $('#keys-list').fadeIn(200);
                    });
                }, 200);
            },

            updateKeyMachineList: function(keyName, data) {
                for (var k = 0; k < this.keys.length; ++k) {
                    if (this.keys[k].name == keyName) {
                        this.keys[k].set('machines', data);
                        return;
                    }
                }
            }
        });
    }
);
