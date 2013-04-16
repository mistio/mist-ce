define('app/controllers/machines', [
    'app/models/machine',
    'ember',
    'jquery'
    ],
    /**
     * Machines controller
     *
     * @returns Class
     */
    function(Machine) {
        return Ember.ArrayController.extend({
            backend: null,

            content: null,

            init: function() {
                this._super();
                this.set('content', []),
                this.refresh();
            },

            refresh: function(){

                if(!this.backend.enabled){
                    this.backend.set('state', 'offline');
                    this.clear();
                    return;
                }

                var that = this;

                
                this.backend.set('state', 'waiting');

                $.getJSON('/backends/' + this.backend.id + '/machines', function(data) {

                    data.forEach(function(item){
                        var found = false;

                        log("item id: " + item.id);

                        that.content.forEach(function(machine){
                            if (machine.id == item.id || (machine.id == -1 && machine.name == item.name)) {
                                found = true;
                                // machine.set(item); //FIXME this does not change anything;
                                if (machine.id == -1) {
                                    machine.set('id', item.id);
                                }
                                machine.set('state', item.state);
                                machine.set('can_stop', item.can_stop);
                                machine.set('can_start', item.can_start);
                                machine.set('can_destroy', item.can_destroy);
                                machine.set('can_reboot', item.can_reboot);
                                machine.set('can_tag', item.can_tag);
                                //FIXME check for changes
                                machine.tags.set('content', item.tags)
                                machine.set('public_ips', item.public_ips);
                                machine.set('extra', item.extra);
                                return false;
                            }
                        });

                        if (!found && !that.backend.create_pending) {
                            item.backend = that.backend;
                            var machine = Machine.create(item);
                            machine.tags.set('content', item.tags)
                            that.pushObject(machine);
                        }

                    });
                    
                    that.content.forEach(function(item) {
                        var found = false;

                        data.forEach(function(machine) {
                            log("machine id: " + machine.id);

                            if (machine.id == item.id) {
                                found = true;
                                return false;
                            }
                        });

                        if (!found && item.id != -1) {
                            log("not found, deleting");
                            that.removeObject(item);
                        }
                    });

                    if(that.backend.enabled){
                        that.backend.set('state', 'online');
                    } else {
                        that.backend.set('state', 'offline');
                    }
                    
                    Mist.backendsController.getMachineCount()
                    
                    Ember.run.later(that, function(){
                        this.refresh();
                    }, that.backend.poll_interval);
                    
                    if (that.backend.error) {
                        that.backend.set('error', false);
                    }
                    
                }).error(function(e) {
                    Mist.notificationController.notify("Error loading machines for backend: " +
                                                        that.backend.title);
                    if (that.backend.error){
                        // This backend seems hopeless, disabling it                            
                        that.backend.set('state', 'offline');
                        that.backend.set('enabled', false);
                    } else {
                        // Mark error but try once again
                        that.backend.set('error', "Error loading machines");
                        Ember.run.later(that, function(){
                            this.refresh();
                        }, that.backend.poll_interval); 
                    }   
                });
            },

            newMachine: function(name, image, size, location, key, script) {
                log('Creating machine', this.name, 'to backend', this.backend.title);

                this.backend.set('create_pending', true);
                
                if (this.backend.provider.search('rackspace') > -1){
                    // Rackspace does not support spaces in names
                    name = name.replace(/ /g,'');
                }
                
                // TODO: find a way to pass ember objects to JSON, so the
                // following will seem less messy. It will also be helpful for tags.
                // http://stackoverflow.com/questions/8669340/ember-model-to-json
                
                var payload = {
                        'name': name,
                        'image': image.id,
                        'size': size.id,
                        // these are only useful for Linode
                        'image_extra': image.extra,
                        'disk': size.disk,
                        'location': location.id,
                        'key': key.name,
                        'script': script,
                };

                var item = {};
                item.state = 'pending';
                item.can_stop = false;
                item.can_start = false;
                item.can_destroy = false;
                item.can_reboot = false;
                item.can_tag = false;
                item.backend = this.backend;
                item.name = name;
                item.image = image;
                item.id = -1;

                var machine = Machine.create(item);
                this.addObject(machine);
                Ember.run.next(function(){
                    $('#machines-list input.ember-checkbox').checkboxradio();    
                });
                var that = this;

                $.ajax({
                    url: 'backends/' + this.backend.id + '/machines',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    headers: { "cache-control": "no-cache" },
                    success: function(data) {
                        info('Successfully sent create machine', name, 'to backend',
                                    that.backend.title);
                        warn(data);
                        if (that.backend.error) {
                            that.backend.set('error', false);
                        }     
                        machine.set("id", data.id);
                        machine.set("name", data.name);
                        machine.set("public_ips", data.public_ips);
                        machine.set("private_ips", data.private_ips);
                        machine.set("extra", data.extra);
                        that.backend.set('create_pending', false);
                        key.machines.addObject([that.backend.id, data.id]);
                        machine.keys.addObject(key);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while sending create machine' +
                                name + ' to backend ' + that.backend.title);
                        error(textstate, errorThrown, 'while creating machine', that.name);
                        that.removeObject(machine);
                        that.backend.set('error', textstate);
                        that.backend.set('create_pending', false);

                    }
                });
            }
        });
    }
);
