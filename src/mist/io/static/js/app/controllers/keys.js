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
            creatingKey: false,
            gettingPublicKey: false,
            gettingPrivateKey: false,



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
                this.set('renamingKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({'newName': newName}),
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Failed to edit key: ' + jqXHR.responseText);
                    },
                    complete: function() {
                        this.set('renamingKey', false);
                        if (callback) { callback(); }
                    }
                });
            },


            deleteKey: function(name) {
                $.ajax({
                    url: '/keys/' + name,
                    type: 'DELETE',
                    success: function(data) {
                        info('Successfully deleted key: ', name);
                        Mist.keysController.updateKeysList(data);
                    },
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error while deleting key: ' + jqXHR.responseText);
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
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error while setting default key: ' + jqXHR.responseText);
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
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error while associating key: ' + keyName +'. ' + jqXHR.responseText);
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
                    error: function(jqXHR) {
                        Mist.notificationController.notify('Error while disassociating key: ' + keyName +'. ' + jqXHR.responseText);
                        $('#manage-keys .ajax-loader').fadeOut(200);
                    }
                });
            },


            getPrivateKey: function(name, callback) {
                this.set('gettingPrivateKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'GET',
                    data: 'action=private',
                    success: function(privateKey) {
                        if (callback) {callback(privateKey);}
                    },
                    error: function() {
                        if (callback) {callback();}
                    },
                    complete: function() {
                        Mist.keysController.set('gettingPrivateKey', false);
                    }
                });
            },
            
            
            getPublicKey: function(name, callback) {
                this.set('gettingPublicKey', true);
                $.ajax({
                    url: '/keys/' + name,
                    type: 'GET',
                    data: 'action=public',
                    success: function(publicKey) {
                        if (callback) { callback(publicKey); }
                    },
                    error: function() {
                        if (callback) { callback(); }
                    },
                    complete: function() {
                        Mist.keysController.set('gettingPublicKey', false);
                    }
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
                    if (content[k].name.replace(/ /g,'') == name) {
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
            }  
        });
    }
);
