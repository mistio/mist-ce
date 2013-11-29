define(['app/models/key'],
    /**
     * Keys Controller
     *
     * @returns Class
     */
    function(Key) {
        return Ember.ArrayController.extend({

            /**
             * 
             *  Properties
             * 
             */

            content: [],
            loading: false,
            keyRequest: false,
            keyResponse: false,
            gettingPublicKey: false,
            gettingPrivateKey: false,

            creatingKey: false,
            renamingKey: false,
            associatingKey: false,
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
                    that.setContent(keys);
                    that.sendKeyResponse();
                }).error(function() {
                    that.reload();
                }).complete(function() {
                    that.set('loading', false);
                });
            }.on('init'),


            reload: function() {
                Ember.run.later(this, function() {
                    this.load();
                }, 5000);
            },



            /**
             * 
             *  Observers
             * 
             */

            keyRequestObserver: function() {
                if (this.keyRequest && !this.loading) {
                    this.sendKeyResponse();
                }
            }.observes('keyRequest'),



            /**
             * 
             *  Methods
             * 
             */

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
                this.set('settingDefaultKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'POST',
                    success: function() {
                        if (callback) callback();
                    },
                    error: function() {
                        Mist.notificationController.notify('Failed to set default key');
                    },
                    complete: function() {
                        Mist.keysController.set('settingDefaultKey', false);
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


            getPrivateKey: function(name, callback) {
                this.set('gettingPrivateKey', true);
                $.getJSON('/keys/' + name + '/private', function(key) {
                    if (callback) callback(key);
                }).error(function() {
                    Mist.notificationController.notify('Failed to get private key');
                }).complete(function() {
                    Mist.keysController.set('gettingPrivateKey', true);
                });
            },
            
            
            getPublicKey: function(name, callback) {
                this.set('gettingPublicKey', true);
                $.getJSON('/keys/' + name + '/public', function(key) {
                    if (callback) callback(key);
                }).error(function() {
                    Mist.notificationController.notify('Failed to get public key');
                }).complete(function() {
                    Mist.keysController.set('gettingPublicKey', true);
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


            setContent: function(keys) {
                var newKeys = [];
                keys.forEach(function(key) {
                    newKeys.push(Key.create(key));
                });
                this.set('content', newKeys);
            },


            sendKeyResponse: function() {
                if (this.keyRequest) {
                    this.set('keyResponse', this.getKeyByUrlName(this.keyRequest));
                    this.set('keyRequest', false);
                }
            },


            _deleteKey: function(name) {
                var newKeys = [];
                this.content.forEach(function(key) {
                    if (key.name != name) {
                        newKeys.push(key);
                    }
                });
                this.set('content', newKeys);
            },


            _renameKey: function(name, newName) {
                var content = this.content;
                var contentLength = this.content.length;
                for (var k = 0; k < contentLength; ++k) {
                    if (content[k].name == name) {
                        content[k].set('name', newName);
                        return;
                    }
                }
            }
        });
    }
);
