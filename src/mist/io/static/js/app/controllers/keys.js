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

            keys: [],
            loadingKeys: null,
            singleKeyRequest: null,
            singleKeyResponse: null,

            init: function() {
                this._super();
                this.loadKeys();
            },

            singleKeyRequestObserver: function() {
                if (this.singleKeyRequest) {
                    if (this.loadingKeys) {
                        Ember.run.later(this, function() {
                            this.singleKeyRequestObserver();
                        }, 1000);
                        return;
                    }
                    $('.ajax-loader.key-loader').hide();
                    this.set('singleKeyResponse', this.getKeyByUrlName(this.singleKeyRequest));
                    this.set('singleKeyRequest', false);
                }
            }.observes('singleKeyRequest'),

            loadKeys: function() {
                this.set('loadingKeys', true);
                $.ajax({
                    url: '/keys',
                    type: 'GET',
                    success: function(data) {
                        info('Successfully loaded keys');
                        Mist.keysController.set('loadingKeys', false);
                        Mist.keysController.updateKeysList(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        Mist.notificationController.notify('Error while loading keys: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while loading keys. ', jqXHR.responseText);
                        Mist.keysController.set('loadingKeys', false);
                    }
                });
            },

            newKey: function(name, privateKey, machine, autoSelect) {
                $('#create-loader').fadeIn(200);
                $('#create-key-ok').button('disable');
                var item = {
                    'name': name,
                    'priv': privateKey
                };
                $.ajax({
                    url: '/keys',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function(data) {
                        info('Successfully created key: ', name);
                        $('#create-loader').fadeOut(200);
                        $('#create-key-dialog').popup('close');
                        Mist.keyAddController.newKeyClear();
                        Mist.keysController.keys.addObject(Key.create(data));
                        if (autoSelect) {
                            Ember.run.next(function() {
                                if ($('#add-backend').length) {
                                    $('.select-keys-listmenu').listview('refresh');
                                    Ember.run.next(function() {
                                        for (var k = 0; k < Mist.keysController.keys.length; ++k) {
                                            if($('.select-keys-listmenu').find('a').eq(k).text() == name) {
                                                $('.select-keys-listmenu').find('a').eq(k).click();
                                            }
                                        }
                                    });
                                } else {
                                    $('.select-key-collapsible .select-listmenu').listview();
                                    $('.select-key-collapsible').parent().trigger('create');
                                    $('.select-key-collapsible li a').eq(0).click();
                                    $('.select-key-collapsible').removeClass('ui-disabled');
                                }
                            });
                        } else if (machine) {
                            Mist.keysController.associateKey(name, machine);
                            $('#manage-keys .ajax-loader').fadeIn(200);
                        } else {
                            Ember.run.next(function() {
                                // < Baremetal
                                $('.select-key-collapsible').trigger('create');
                                $('.select-key-collapsible').collapsible();
                                // Baremetal />
                                $('#keys-list').listview('refresh');
                                $('#keys-list input.ember-checkbox').checkboxradio();
                            });
                        }
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while creating key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while creating key: ', name, '. ', jqXHR.responseText);
                        $('#create-loader').fadeOut(200);
                        $('#create-key-ok').button('enable');
                    }
                });
                item.priv = privateKey = null; // Don't keep private key on client
            },

            deleteKey: function(name) {
                $.ajax({
                    url: '/keys/' + name,
                    type: 'DELETE',
                    success: function(data) {
                        info('Successfully deleted key: ', name);
                        Mist.keysController.updateKeysList(data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while deleting key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while deleting key: ', name, '. ', jqXHR.responseText);
                    }
                });
            },

            editKey: function(oldName, newName) {
                var item = {
                    'newName': newName,
                };
                $.ajax({
                    url: '/keys/' + oldName,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify(item),
                    success: function() {
                        info('Successfully edited key: ', oldName);
                        $("#edit-key-dialog").popup("close");
                        Mist.keysController.getKeyByName(oldName).set('name', newName);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while editting key: ' + jqXHR.responseText);
                        error(textstate, errorThrown, ' while editting key: ', oldName, '. ', jqXHR.responseText);
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
                        error(textstate, errorThrown, ' while setting default key: ', name, '. ', jqXHR.responseText);
                    }
                });
            },

            associateKey: function(keyName, machine) {
                var payload = {
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
                        info('Successfully associated key: ', keyName, ', with machine: ', machine.id);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.keysController.updateKeyMachinesList(keyName, data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while associating key: ' + keyName);
                        error(textstate, errorThrown, ' while associating key: ', keyName, '. ', jqXHR.responseText);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                    }
                });
            },

            disassociateKey: function(keyName, machine) {
                var backend_id = null;
                if (machine.isGhost && (!machine.backend.id)) {
                    backend_id = machine.backend;
                } else {
                    backend_id = machine.backend.id;
                }
                var payload = {
                    'key_id': keyName,
                    'backend_id': backend_id,
                    'machine_id': machine.id,
                    'host': machine.isGhost ? null : machine.getHost(),
                };
                $.ajax({
                    url: '/backends/' + backend_id + '/machines/' + machine.id + '/keys/' + keyName,
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function(data) {
                        info('Successfully disassociated key: ', keyName, ' with machine: ', machine.id);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                        Mist.keysController.updateKeyMachinesList(keyName, data);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while disassociating key: ' + keyName);
                        error(textstate, errorThrown, ' while disassociating key: ', keyName, '. ', jqXHR.responseText);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                    }
                });
            },

            getPrivKey: function(keyName, element) {
                $.ajax({
                    url: '/keys/' + keyName,
                    type: 'GET',
                    data: 'action=private',
                    success: function(data) {
                        info('Successfully got private key: ' + keyName);
                        $(element).val(data).trigger('change');
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while getting private key: ' + keyName);
                        error(textstate, errorThrown, ' while getting private key: ', keyName, '. ', jqXHR.responseText);
                    }
                });
            },
            
            getPubKey: function(keyName, element) {
                $.ajax({
                    url: '/keys/' + keyName,
                    type: 'GET',
                    data: 'action=public',
                    success: function(data) {
                        info('Successfully got public key: ' + keyName);
                        $(element).val(data).trigger('change');
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while getting public key: ' + keyName);
                        error(textstate, errorThrown, ' while getting public key: ', keyName, '. ', jqXHR.responseText);
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

            getKeyByUrlName: function(keyName) {
                for (var k = 0; k < this.keys.length; ++k) {
                    if (this.keys[k].name.replace(/ /g,'') == keyName) {
                        return this.keys[k];
                    }
                }
                return null;
            },

            updateKeysList: function(data) {
                var newKeys = new Array();
                data.forEach(function(key) {
                    newKeys.push(Key.create(key));
                });
                this.set('keys', newKeys);
                Ember.run.next(function(){
                    try {
                        $('#keys-list').listview('refresh');
                        $('#keys-list input.ember-checkbox').checkboxradio();
                    } catch (e) {}
                });
            },

            updateKeyMachinesList: function(keyName, data) {
                this.keys.some(function(key) {
                    if(key.name == keyName) {
                        key.set('machines', data ? data : new Array());
                        return true;
                    }
                });
            }
        });
    }
);
