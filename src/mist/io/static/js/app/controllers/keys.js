define(['app/models/key'],
    /**
     * Keys Controller
     *
     * @returns Class
     */
    function(Key) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             *  Properties
             */

            content: [],
            loading: false,
            keyRequest: false,
            creatingKey: false,
            renamingKey: false,
            uploadingKey: false,
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
                Mist.ajaxGET('/keys', {
                }).success(function(keys) {
                    that._setContent(keys);
                }).error(function() {
                    that._reload();
                }).complete(function(success) {
                    that.set('loading', false);
                    that.trigger('load');
                });
            }.on('init'),



            /**
             * 
             *  Methods
             * 
             */

            createKey: function(id, privateKey, callback) {
                var that = this;
                this.set('creatingKey', true);
                Mist.ajaxPUT('/keys', {
                    'id': id,
                    'priv': privateKey
                }).success(function(key) {
                    that._createKey(key);
                }).error(function() {
                    Mist.notificationController.notify('Failed to create key');
                }).complete(function(success) {
                    that.set('creatingKey', false);
                    if (callback) callback(success);
                });
                privateKey = null;
            },


            renameKey: function(id, newId, callback) {
                var that = this;
                this.set('renamingKey', true);
                Mist.ajaxPUT('/keys/' + id, {
                    'new_id': newId
                }).success(function() {
                    that._renameKey(id, newId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to rename key');
                }).complete(function(success) {
                    that.set('renamingKey', false);
                    if (callback) callback(success);
                });
            },


            deleteKey: function(id, callback) {
                var that = this;
                this.set('deletingKey', true);
                Mist.ajaxDELETE('/keys/' + id, {
                }).success(function() {
                    that._deleteKey(id);
                }).error(function() {
                    Mist.notificationController.notify('Failed to delete key');
                }).complete(function(success) {
                    that.set('deletingKey', false);
                    if (callback) callback(success);
                });
            },


            setDefaultKey: function(id, callback) {
                var that = this;
                this.set('settingDefaultKey', true);
                Mist.ajaxPOST('/keys/' + id, {
                }).success(function() {
                    that._setDefaultKey(id);
                }).error(function() {
                    Mist.notificationController.notify('Failed to set default key');
                }).complete(function(success) {
                    that.set('settingDefaultKey', false);
                    if (callback) callback(success);
                });
            },


            associateKey: function(keyId, backendId, machineId, host, callback) {
                var that = this;
                this.set('associatingKey', true);
                Mist.ajaxPUT('/backends/' + backendId + '/machines/' + machineId + '/keys/' + keyId, {
                    'host': host
                }).error(function() {
                     Mist.notificationController.notify('Failed to associate key');
                }).complete(function(success) {
                    that.set('associatingKey', false);
                    if (callback) callback(success);
                });
            },


            disassociateKey: function(keyId, backendId, machineId, host, callback) {
                var that = this;
                this.set('disassociatingKey', true);
                Mist.ajaxDELETE('/backends/' + backendId + '/machines/' + machineId + '/keys/' + keyId, {
                    'host': host
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
                Mist.ajaxPOST('/keys', {
                }).error(function() {
                    Mist.notificationController.notify('Failed to generate key');
                }).complete(function(success, key) {
                    that.set('generatingKey', false);
                    if (callback) callback(success, key.priv);
                });
            },


            getPrivateKey: function(id, callback) {
                var that = this;
                this.set('gettingPrivateKey', true);
                Mist.ajaxGET('/keys/' + id + '/private', {
                }).error(function() {
                    Mist.notificationController.notify('Failed to get private key');
                }).complete(function(success, key) {
                    that.set('gettingPrivateKey', false);
                    if (callback) callback(success, key);
                });
            },


            getPublicKey: function(id, callback) {
                var that = this;
                this.set('gettingPublicKey', true);
                Mist.ajaxGET('/keys/' + id + '/public', {
                }).error(function() {
                    Mist.notificationController.notify('Failed to get public key');
                }).complete(function(success, key) {
                    that.set('gettingPublicKey', false);
                    if (callback) callback(success, key);
                });
            },


            getKey: function(id) {
                return this.content.findBy('id', id);
            },


            getRequestedKey: function() {
                if (this.keyRequest) {
                    return this.getKey(this.keyRequest);
                }
            },


            keyExists: function(id) {
                return !!this.getKey(id);
            },



            /**
             * 
             *  Psudo-Private Methods
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
                    keys.forEach(function(key) {
                        that.content.pushObject(Key.create(key));
                    });
                    that.trigger('onKeyListChange');
                });
            },


            _createKey: function(key) {
                Ember.run(this, function() {
                    this.content.pushObject(Key.create(key));
                    this.trigger('onKeyListChange');
                    this.trigger('onKeyCreate');
                });
            },


            _deleteKey: function(id) {
                Ember.run(this, function() {
                    this.content.removeObject(this.getKey(id));
                    this.trigger('onKeyListChange');
                    this.trigger('onKeyDelete');
                });
            },


            _renameKey: function(id, newId) {
                Ember.run(this, function() {
                    this.getKey(id).set('id', newId);
                    this.trigger('onKeyRename');
                });
            },


            _setDefaultKey: function(id) {
                Ember.run(this, function() {
                    this.content.forEach(function(key) {
                        key.set('default_key', key.id == id);
                    });
                    this.trigger('onKeyDefaultSet');
                });
            }
        });
    }
);
