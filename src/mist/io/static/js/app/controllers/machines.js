define('app/controllers/machines', ['app/models/machine'],
    /**
     *  Machines Controller
     * 
     *  @returns Class
     */
    function(Machine) {
        return Ember.ArrayController.extend(Ember.Evented, {

            /**
             *  Properties
             */

            content: [],
            loading: null,
            backend: null,

            /**
             * 
             *  Initialization
             * 
             */
            
            load: function() {

                if (!this.backend.enabled) return;

                var that = this;
                this.set('loading', true);
                Mist.ajaxGET('/backends/' + this.backend.id + '/machines', {
                }).success(function(machines) {
                    if (!that.backend.enabled) return;
                    that._setContent(machines);
                    that._reload();
                }).error(function() {
                    if (!that.backend.enabled) return;
                    Mist.notificationController.notify('Failed to load machines for ' + that.backend.title);
                    that.backend.set('enabled', false);
                }).complete(function(success) {
                    if (!that.backend.enabled) return;
                    that.set('loading', false);
                    that.trigger('onLoad');
                });
            },


            newMachine: function(name, image, size, location, key, script) {
                
                this.backend.set('create_pending', true);
                
                if (this.backend.provider.search('rackspace_first_gen') > -1) {
                    // Rackspace (first gen) does not support spaces in names
                    name = name.replace(/ /g,'');
                }
                
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
                item.pendingCreation = true;
                
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
                        if (that.backend.error) {
                            that.backend.set('error', false);
                        }

                        machine.set("id", data.id);
                        machine.set("name", data.name);
                        machine.set("public_ips", data.public_ips);
                        machine.set("private_ips", data.private_ips);
                        machine.set("extra", data.extra);
                        machine.set('pendingCreation', false);
                        that.backend.set('create_pending', false);
                        
                        var key_machines = new Array();
                        key.machines.forEach(function(machine) {
                            key_machines.push(machine); 
                        });
                        key_machines.push([machine.backend.id, machine.id, Date.now()]);
                        Mist.keysController.updateKeyMachinesList(key.name, key_machines);
                        
                        machine.set('keysCount', 1);
                        Ember.run.next(function() {
                            $('#mist-manage-keys').parent().trigger('create');
                        });
                        machine.probe(key.name);
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.timeNotify(jqXHR.responseText, 15000);
                        error(textstate, errorThrown, 'while creating machine', that.name);
                        machine.set('pendingCreation', false);
                        that.removeObject(machine);
                        that.backend.set('error', textstate);
                        that.backend.set('create_pending', false);
                    }
                });
            },



            /**
             * 
             *  Methods
             * 
             */

            clear: function() {
                Ember.run(this, function() {
                    this.set('content', []);
                    this.set('loading', false);
                    this.trigger('onMachineListChange');
                });
            },


            getMachine: function(machineId) {
                return this.content.findBy('id', machineId);
            },



            /**
             * 
             *  Pseudo-Private Methods
             * 
             */

            _reload: function() {
                Ember.run.later(this, function() {
                    this.load();
                }, this.backend.poll_interval);
            },


            _setContent: function(machines) {
                var that = this;
                Ember.run(function() {
                    that.set('content', []);
                    machines.forEach(function(machine) {
                        that.content.pushObject(Machine.create(machine));
                    });
                    that.trigger('onMachineListChange');
                });
            }
        });
    }
);
