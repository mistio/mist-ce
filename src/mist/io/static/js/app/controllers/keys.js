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
                Mist.getAJAX('/keys', {
                }).success(function(keys) {
                    that._setContent(keys);
                }).error(function(message) {
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

            createKey: function(name, privateKey, callback) {
                var that = this;
                this.set('creatingKey', true);
                Mist.ajaxPUT('/keys', {
                    'name': name,
                    'priv': privateKey
                }).success(function(key) {
                    that._createKey(key);
                }).error(function(message) {
                    Mist.notificationController.notify('Failed to create key');
                }).complete(function(success) {
                    that.set('creatingKey', false);
                    if (callback) callback(success);
                });
                privateKey = null; // Don't keep private key on the client
            },


            renameKey: function(name, newName, callback) {
                var that = this;
                this.set('renamingKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'PUT',
                    data: JSON.stringify({'newName': newName}),
                    success: function() {
                        that._renameKey(name, newName);
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to rename key');
                    },
                    complete: function(jqXHR) {
                        that.set('renamingKey', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            deleteKey: function(name, callback) {
                var that = this;
                this.set('deletingKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'DELETE',
                    success: function() {
                        that._deleteKey(name);
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to delete key');
                    },
                    complete: function(jqXHR) {
                        that.set('deletingKey', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            setDefaultKey: function(name, callback) {
                var that = this;
                this.set('settingDefaultKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'POST',
                    success: function() {
                        that._setDefaultKey(name);
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to set default key');
                    },
                    complete: function(jqXHR) {
                        that.set('settingDefaultKey', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            associateKey: function(keyName, backendId, machineId, host, callback) {
                this.set('associatingKey', true);
                $.ajax({
                    url: '/backends/' + backendId + '/machines/' + machineId + '/keys/' + keyName,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({'host': host}),
                    success: function() {
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to associate key');
                    },
                    complete: function(jqXHR) {
                        Mist.keysController.set('associatingKey', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            disassociateKey: function(keyName, backendId, machineId, host, callback) {
                this.set('disassociatingKey', true);
                $.ajax({
                    url: '/backends/' + backendId + '/machines/' + machineId + '/keys/' + keyName,
                    type: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify({'host': host}),
                    success: function() {
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to disassociate key');
                    },
                    complete: function(jqXHR) {
                        Mist.keysController.set('disassociatingKey', false);
                        if (callback) callback(jqXHR.status == 200);
                    }
                });
            },


            generateKey: function(callback) {
                this.set('generatingKey', true);
                $.ajax({
                    url: '/keys',
                    type: 'POST',
                    success: function(key) {
                        if (callback) callback(key.priv);
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to generate key');
                    },
                    complete: function() {
                        Mist.keysController.set('generatingKey', false);
                    }
                });
            },


            getPrivateKey: function(name, callback) {
                this.set('gettingPrivateKey', true);
                $.getJSON('/keys/' + name + '/private', function(key) {
                    if (callback) callback(key);
                }).error(function() {
                    Mist.notificationController.notify('Failed to get private key');
                }).complete(function() {
                    Mist.keysController.set('gettingPrivateKey', false);
                });
            },


            getPublicKey: function(name, callback) {
                this.set('gettingPublicKey', true);
                $.getJSON('/keys/' + name + '/public', function(key) {
                    if (callback) callback(key);
                }).error(function() {
                    Mist.notificationController.notify('Failed to get public key');
                }).complete(function() {
                    Mist.keysController.set('gettingPublicKey', false);
                });
            },


            getKey: function(id) {
                return this.content.findBy('id', id);
            },


            getSelectedKeysCount: function() {
                var counter = 0;
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].selected) ++counter;
                }
                return counter;
            },


            getSelectedKeyName: function() {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].selected) return content[k].name;
                }
            },

            getRequestedKey: function() {
                if (this.keyRequest) {
                    return this.getKeyByUrlName(this.keyRequest);
                }
            },
            
            keyNameExists: function(name) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].name == name) {
                        return true;
                    }
                }
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
