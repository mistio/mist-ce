define('app/controllers/keys', ['app/models/key' , 'ember'],
    //
    //  Keys Controller
    //
    //  @returns Class
    //
    function (Key) {

        'use strict';

        return Ember.Controller.extend(Ember.Evented, {


            //
            //  Properties
            //


            model: [],
            selectedKeys: [],
            filteredKeys: [],

            loading: false,
            addingKey: false,
            keyRequest: false,
            renamingKey: false,
            associatingKey: false,
            gettingPublicKey: false,
            gettingPrivateKey: false,
            disassociatingKey: false,
            settingDefaultKey: false,
            searchTerm: null,
            sortByTerm: 'default',

            //
            //  Computed Properties
            //

            sortById: Ember.computed('sortByTerm', function () {
                return this.get('sortByTerm') == 'id';
            }),

            sortByDefault: Ember.computed('sortByTerm', function () {
                return this.get('sortByTerm') == 'default';
            }),

            sortedKeys: Ember.computed('filteredKeys', 'filteredKeys.@each.id', 'filteredKeys.@each.isDefault', 'sortByTerm', function() {
                if(this.get('filteredKeys'))
                {
                    if (this.get('sortById'))
                    {
                        return this.get('filteredKeys').sortBy('id');
                    }

                    if (this.get('sortByDefault'))
                    {
                        return this.get('filteredKeys').sortBy('isDefault').reverse();
                    }
                }
            }),


            //
            //
            //  Initialization
            //
            //


            init: function () {
                this._super();
                this.set('model', []);
                this.set('loading', true);
            },


            //
            //
            //  Methods
            //
            //


            load: function(keys) {
                this._updateModel(keys);
                this.set('loading', false);
            },


            addKey: function(args) {
                var that = this;
                this.set('addingKey', true);
                Mist.ajax.PUT('/keys', {
                    'id': args.keyId,
                    'priv': args.keyPrivate
                }).success(function (key) {
                    that._addKey(key);
                }).error(function (message) {
                    Mist.notificationController.notify(message);
                }).complete(function (success, key) {
                    that.set('addingKey', false);
                    if (args.callback)
                        args.callback(success, that.getKey(key ? key.id : null));
                });
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
                Mist.ajax.PUT('/clouds/' + machine.cloud.id + '/machines/' + machine.id + '/keys/' + keyId, {
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
                var cloud_id = machine.cloud.id ? machine.cloud.id : machine.cloud;
                var that = this;
                this.set('disassociatingKey', true);
                Mist.ajax.DELETE('/clouds/' + cloud_id + '/machines/' + machine.id + '/keys/' + keyId, {
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


            generateKey: function(args) {
                var that = this;
                this.set('generatingKey', true);
                Mist.ajax.POST('/keys', {
                }).error(function () {
                    Mist.notificationController.notify(
                        'Failed to generate key');
                }).complete(function (success, key) {
                    that.set('generatingKey', false);
                    if (args.callback) args.callback(success, key.priv, key.public);
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
                return this.model.findBy('id', keyId);
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
                this.model.forEach(function(key) {
                    key.machines.some(function(key_machine) {
                        if (machine.equals(key_machine)) {
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

            _updateModel: function (keys) {
                Ember.run(this, function() {

                    // Remove deleted keys
                    this.model.forEach(function (key) {
                        if (!keys.findBy('id', key.id))
                            this._deleteKey(key.id);
                    }, this);

                    keys.forEach(function (key) {

                        var oldKey = this.getKey(key.id);

                        if (oldKey)
                            // Update existing keys
                            forIn(key, function (value, property) {
                                oldKey.set(property, value);
                            });
                        else
                            // Add new keys
                            this._addKey(key);
                    }, this);

                    this.trigger('onKeyListChange');
                });
            },


            _addKey: function(key) {
                Ember.run(this, function() {
                    if (this.keyExists(key.id)) return;
                    this.model.addObject(Key.create(key));
                    this.trigger('onKeyAdd');
                });
            },


            _deleteKey: function(keyId) {
                Ember.run(this, function() {
                    this.model.removeObject(this.getKey(keyId));
                    this.trigger('onKeyDelete');
                });
            },


            _renameKey: function(keyId, newKeyId) {
                Ember.run(this, function() {
                    if (this.keyExists(keyId))
                        this.getKey(keyId).set('id', newKeyId);
                    this.trigger('onKeyRename');
                });
            },


            _setDefaultKey: function(keyId) {
                Ember.run(this, function() {
                    this.model.forEach(function (key) {
                        key.set('isDefault', key.id == keyId);
                    });
                    this.trigger('onDefaultKeySet');
                });
            },


            _associateKey: function(keyId, machine) {
                Ember.run(this, function() {
                    var key = this.getKey(keyId);
                    key.machines.pushObject([machine.cloud.id, machine.id]);
                    Mist.machineKeysController.probe(key);
                    machine.setProperties({
                        probed: true,
                        keysCount: this.getMachineKeysCount(machine),
                    });
                    this.trigger('onKeyAssociate');
                });
            },


            _disassociateKey: function(keyId, machine) {
                Ember.run(this, function() {
                    var key = this.getKey(keyId);
                    key.machines.some(function (key_machine) {
                        if (key_machine[1] == machine.id && (key_machine[0] == machine.cloud.id ||
                                                             key_machine[0] == machine.cloud)) { // For ghost machines
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
                    this.filteredKeys.forEach(function(key) {
                        if (key.selected) newSelectedKeys.push(key);
                    });
                    this.set('selectedKeys', newSelectedKeys);
                    this.trigger('onSelectedKeysChange');
                });
            },


            _updateFilteredKeys: function() {
                Ember.run(this, function() {
                    var keys = [];

                    if (this.searchTerm) {
                        var that = this;
                        this.model.forEach(function(key) {
                            var regex = new RegExp(that.searchTerm, 'i');

                            if (regex.test(key.id)) {
                                keys.push(key);
                            } else {
                                if (key.selected) {
                                    key.set('selected', false);
                                }
                            }
                        });
                    } else {
                        keys = this.model;
                    }

                    this.set('filteredKeys', keys);
                });
            },


            clearSearch: function() {
                this.set('searchTerm', null);
            },



            /**
             *
             *  Observers
             *
             */

            selectedKeysObserver: function() {
                Ember.run.once(this, '_updateSelectedKeys');
            }.observes('filteredKeys.@each.selected'),


            filteredKeysObserver: function() {
                Ember.run.once(this, '_updateFilteredKeys');
            }.observes('model.@each.id', 'searchTerm', 'model.[]')
        });
    }
);
