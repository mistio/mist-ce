define(['app/models/key'],
    /**
     *  Keys Controller
     *
     *  @returns Class
     */
    function(Key) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             *  Properties
             */

            content: [],
            selectedKeys: [],

            loading: false,
            addingKey: false,
            keyRequest: false,
            renamingKey: false,
            associatingKey: false,
            gettingPublicKey: false,
            gettingPrivateKey: false,
            disassociatingKey: false,
            settingDefaultKey: false,


            /**
             *
             *  Initialization
             *
             */

            load: function() {
                var that = this;
                this.set('loading', true);
                Mist.ajax.GET('/keys', {
                }).success(function(keys) {
                    that._setContent(keys);
                }).error(function() {
                    that._reload();
                }).complete(function(success) {
                    that.set('loading', false);
                    that.trigger('onLoad');
                });
            }.on('init'),


            /**
             *
             *  Methods
             *
             */

            addKey: function(keyId, keyPrivate, callback) {
                var that = this;
                this.set('addingKey', true);
                Mist.ajax.PUT('/keys', {
                    'id': keyId,
                    'priv': keyPrivate
                }).success(function(key) {
                    that._addKey(key);
                }).error(function(message) {
                    Mist.notificationController.notify(message);
                }).complete(function(success, key) {
                    that.set('addingKey', false);
                    if (callback) callback(success, key);
                });
                keyPrivate = null;
            },


            renameKey: function(keyId, newKeyId, callback) {
                var that = this;
                this.set('renamingKey', true);
                Mist.ajax.PUT('/keys/' + keyId, {
                    'new_id': newKeyId
                }).success(function() {
                    that._renameKey(keyId, newKeyId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to rename key');
                }).complete(function(success) {
                    that.set('renamingKey', false);
                    if (callback) callback(success);
                });
            },


            deleteKey: function(keyId, callback) {
                var that = this;
                this.set('deletingKey', true);
                Mist.ajax.DELETE('/keys/' + keyId, {
                }).success(function() {
                    that._deleteKey(keyId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to delete key');
                }).complete(function(success) {
                    that.set('deletingKey', false);
                    if (callback) callback(success);
                });
            },


            setDefaultKey: function(keyId, callback) {
                var that = this;
                this.set('settingDefaultKey', true);
                Mist.ajax.POST('/keys/' + keyId, {
                }).success(function() {
                    that._setDefaultKey(keyId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to set default key');
                }).complete(function(success) {
                    that.set('settingDefaultKey', false);
                    if (callback) callback(success);
                });
            },


            // BIG TODO: Callback argument should be at the end of the parameters
            // We need to check every call to this function and change it (not urgent)
            associateKey: function(keyId, machine, callback, user , port) {

                var that = this;
                this.set('associatingKey', true);
                Mist.ajax.PUT('/backends/' + machine.backend.id + '/machines/' + machine.id + '/keys/' + keyId, {
                    'host': machine.getHost(),
                    'user': user,
                    'port': port
                }).success(function() {
                    that._associateKey(keyId, machine);
                }).error(function() {
                    // Try another user/port
                    Mist.machineKeysController.openSSH_Details();
                }).complete(function(success) {
                    that.set('associatingKey', false);
                    if (callback) callback(success, machine, keyId);
                });
            },


            disassociateKey: function(keyId, machine, host, callback) {
                var backend_id = machine.backend.id ? machine.backend.id : machine.backend;
                var that = this;
                this.set('disassociatingKey', true);
                Mist.ajax.DELETE('/backends/' + backend_id + '/machines/' + machine.id + '/keys/' + keyId, {
                    'host': machine.getHost()
                }).success(function() {
                    that._disassociateKey(keyId, machine);
                }).error(function() {
                    Mist.notificationController.notify('Failed to disassociate key');
                }).complete(function(success) {
                    that.set('disassociatingKey', false);
                    if (callback) callback(success);
                });
            },


            generateKey: function(callback) {
                var that = this;
                this.set('generatingKey', true);
                Mist.ajax.POST('/keys', {
                }).error(function() {
                    Mist.notificationController.notify('Failed to generate key');
                }).complete(function(success, key) {
                    that.set('generatingKey', false);
                    if (callback) callback(success, key.priv);
                });
            },


            getPrivateKey: function(keyId, callback) {
                var that = this;
                this.set('gettingPrivateKey', true);
                Mist.ajax.GET('/keys/' + keyId + '/private', {
                }).error(function() {
                    Mist.notificationController.notify('Failed to get private key');
                }).complete(function(success, keyPriv) {
                    that.set('gettingPrivateKey', false);
                    if (callback) callback(success, keyPriv);
                });
            },


            getPublicKey: function(keyId, callback) {
                var that = this;
                this.set('gettingPublicKey', true);
                Mist.ajax.GET('/keys/' + keyId + '/public', {
                }).error(function() {
                    Mist.notificationController.notify('Failed to get public key');
                }).complete(function(success, keyPub) {
                    that.set('gettingPublicKey', false);
                    if (callback) callback(success, keyPub);
                });
            },


            getKey: function(keyId) {
                return this.content.findBy('id', keyId);
            },


            getRequestedKey: function() {
                if (this.keyRequest) {
                    return this.getKey(this.keyRequest);
                }
            },


            keyExists: function(keyId) {
                return !!this.getKey(keyId);
            },


            getMachineKeysCount: function(machine) {
                var count = 0;
                this.content.forEach(function(key) {
                    key.machines.some(function(key_machine) {
                        if (key_machine[1] == machine.id && key_machine[0] == machine.backend.id) {
                            return ++count;
                        }
                    });
                });
                return count;
            },


            /**
             *
             *  Pseudo-Private Methods
             *
             */

            _reload: function() {
                Ember.run.later(this, function() {
                    this.load();
                }, 2000);
            },


            _setContent: function(keys) {
                var that = this;
                Ember.run(function() {
                    that.set('content', []);
                    keys.forEach(function(key) {
                        that.content.pushObject(Key.create(key));
                    });
                    that.trigger('onKeyListChange');
                });
            },


            _addKey: function(key) {
                Ember.run(this, function() {
                    this.content.pushObject(Key.create(key));
                    this.trigger('onKeyListChange');
                    this.trigger('onKeyAdd');
                });
            },


            _deleteKey: function(keyId) {
                Ember.run(this, function() {
                    this.content.removeObject(this.getKey(keyId));
                    this.trigger('onKeyListChange');
                    this.trigger('onKeyDelete');
                });
            },


            _renameKey: function(keyId, newKeyId) {
                Ember.run(this, function() {
                    this.getKey(keyId).set('id', newKeyId);
                    this.trigger('onKeyRename');
                });
            },


            _setDefaultKey: function(keyId) {
                Ember.run(this, function() {
                    this.content.forEach(function(key) {
                        key.set('isDefault', key.id == keyId);
                    });
                    this.trigger('onDefaultKeySet');
                });
            },


            _associateKey: function(keyId, machine) {
                Ember.run(this, function() {
                    this.getKey(keyId).machines.pushObject([machine.backend.id, machine.id]);
                    machine.set('keysCount', this.getMachineKeysCount(machine));
                    machine.set('probed', true);
                    machine.probe(keyId);
                    this.trigger('onKeyAssociate');
                });
            },


            _disassociateKey: function(keyId, machine) {
                Ember.run(this, function() {
                    var key = this.getKey(keyId);
                    key.machines.some(function(key_machine) {
                        if (key_machine[1] == machine.id && (key_machine[0] == machine.backend.id ||
                                                             key_machine[0] == machine.backend)) { // For ghost machines
                            key.machines.removeObject(key_machine);
                            return true;
                        }
                    });
                    machine.set('keysCount', this.getMachineKeysCount(machine));
                    machine.set('probed', !!machine.keysCount);
                    this.trigger('onKeyDisassociate');
                });
            },


            _updateSelectedKeys: function() {
                Ember.run(this, function() {
                    var newSelectedKeys = [];
                    this.content.forEach(function(key) {
                        if (key.selected) newSelectedKeys.push(key);
                    });
                    this.set('selectedKeys', newSelectedKeys);
                    this.trigger('onSelectedKeysChange');
                });
            },



            /**
             *
             *  Observers
             *
             */

            selectedKeysObserver: function() {
                Ember.run.once(this, '_updateSelectedKeys');
            }.observes('content.@each.selected')
        });
    }
);
