define(['app/models/key'],
    /**
     * Keys Controller
     *
     * @returns Class
     */
    function(Key) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             * 
             *  Properties
             * 
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
                $.getJSON('/keys', function(keys) {
                    that._setContent(keys);
                }).error(function() {
                    that._reload();
                }).complete(function() {
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
                $.ajax({
                    url: '/keys',
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({'name': name, 'priv': privateKey}),
                    success: function(key) {
                        that._createKey(key);
                        if (callback) callback();
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Failed to create key');
                        $('#create-key-ok').removeClass('ui-state-disabled');
                    },
                    complete: function() {
                        that.set('creatingKey', false);
                        that.trigger('createdKey');
                        that.trigger('keysChanged');
                    }
                });
                privateKey = null; // Don't keep private key on client
            },


            renameKey: function(name, newName, callback) {
                var that = this;
                this.set('renamingKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({'newName': newName}),
                    success: function() {
                        that._renameKey(name, newName);
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to rename key');
                    },
                    complete: function() {
                        that.set('renamingKey', false);
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
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to delete key');
                    },
                    complete: function() {
                        that.set('deletingKey', false);
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
                    complete: function() {
                        that.set('settingDefaultKey', false);
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
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to associate key');
                    },
                    complete: function() {
                        Mist.keysController.set('associatingKey', false);
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
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to disassociate key');
                    },
                    complete: function() {
                        Mist.keysController.set('disassociatingKey', false);
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


            getKeyByName: function(name) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].name == name) {
                        return content[k];
                    }
                }
            },


            getKeyByUrlName: function(name) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].id == name) {
                        return content[k];
                    }
                }
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

            _setContent: function(keys) {
                var newKeys = [];
                var keysLength = keys.length;
                for (var k = 0; k < keysLength; ++k) {
                    newKeys.push(Key.create(keys[k]));
                }
                this.set('content', newKeys);
            },


            _reload: function() {
                Ember.run.later(this, function() {
                    this.load();
                }, 2000);
            },


            _createKey: function(key) {
                this.content.pushObject(Key.create(key));
            },


            _renameKey: function(name, newName) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].name == name) {
                        content[k].set('name', newName);
                        content[k].set('id', newName);
                        return;
                    }
                }
            },


            _deleteKey: function(name) {
                Ember.run(this, function() {
                    var newKeys = [];
                    var wasDefault = false;
                    var content = this.content;
                    var contentLength = this.content.length;
                    for (var k = 0; k < contentLength; ++k) {
                        if (content[k].name != name) {
                            newKeys.push(content[k]);
                        } else if (content[k].default_key) {
                            wasDefault = true;
                        }
                    }
                    this.set('content', newKeys);
                    if (wasDefault && this.content.length) {
                        Ember.run.next(this, function() {
                            this.setDefaultKey(this.content[0].name);
                        });
                    }
                });
            },


            _setDefaultKey: function(name) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].name == name) {
                        content[k].set('default_key', true);
                    } else {
                        content[k].set('default_key', false);
                    }
                }
            }
        });
    }
);
