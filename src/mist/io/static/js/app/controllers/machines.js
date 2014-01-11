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
            addingMachine: null,
            startingMachine: null,
            rebootingMachine: null,
            destroyingMachine: null,
            shutingdownMachine: null,


            /**
             * 
             *  Initialization
             * 
             */
            
            load: function() {

                if (!this.backend.enabled) return;

                var that = this;
                this.set('loading', true);
                Mist.ajax.GET('/backends/' + this.backend.id + '/machines', {
                }).success(function(machines) {
                    if (!that.backend.enabled) return;
                    that._updateContent(machines);
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


            /**
             * 
             *  Methods
             * 
             */

            newMachine: function(name, image, size, location, key, script) {
                
                // Create a fake machine model for the user
                // to see until we get the real machine from
                // the server
                var dummyMachine = Machine.create({
                    'state': 'pending',
                    'backend': this.backend,
                    'name': name,
                    'image': image,
                    'id': -1,
                    'pendingCreation': true
                });
                this.addObject(dummyMachine);

                var that = this;
                this.set('addingMachine', true);
                Mist.ajax.POST('backends/' + this.backend.id + '/machines', {
                        'name': name,
                        'key': key.id,
                        'size': size.id,
                        'script': script,
                        'image': image.id,
                        'location': location.id,
                        // these are only useful for Linode
                        'disk': size.disk,
                        'image_extra': image.extra
                }).success(function (machine) {
                    that._createMachine(machine, key);
                }).error(function () {
                    that.removeObject(dummyMachine);
                }).complete(function (success, machine) {
                    that.set('addingMachine', false);
                    that.set('onMachineAdd');
                });
            },


            shutdownMachine: function(machineId) {
                var that = this;
                this.set('shutingdownMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'stop'
                }).success(function() {
                    //that._shutdownMachine(machineId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to shutdown machine');
                }).complete(function() {
                    that.set('shutingdownMachine', false);
                    that.trigger('onMachineShutdown');
                });
            },


            destroyMachine: function(machineId) {
                var that = this;
                this.set('destroyingMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'destroy'
                }).success(function() {
                    //that._destroyMachine(machineId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to destory machine');
                }).complete(function() {
                    that.set('destroyingMachine', false);
                    that.trigger('onMachineDestroy');
                });
            },


            rebootMachine: function(machineId) {
                var that = this;
                this.set('rebootingMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'reboot'
                }).success(function() {
                    //that.rebootMachine(machineId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to reboot machine');
                }).complete(function() {
                    that.set('rebootingMachine', false);
                    that.trigger('onMachineReboot');
                });
            },


            startMachine: function(machineId) {
                var that = this;
                this.set('startingMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'start'
                }).success(function() {
                    //that.startMachine(machineId);
                }).error(function() {
                    Mist.notificationController.notify('Failed to start machine');
                }).complete(function() {
                    that.set('startingMachine', false);
                    that.trigger('onMachineStart');
                });
            },


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


            machineExists: function(machineId) {
                return !!this.getMachine(machineId);
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


            _updateContent: function(machines) {
                var that = this;
                Ember.run(function() {

                    // Replace dummy machines (newly created)

                    var dummyMachines = that.content.filterBy('id', -1);

                    dummyMachines.forEach(function(machine) {
                        var realMachine = machines.findBy('name', machine.name);
                        if (realMachine) {
                            for (attr in realMachine)
                                machine.set(attr, realMachine[attr]);
                        }
                    });

                    // Remove deleted machines

                    that.content.forEach(function(machine) {
                        if (!machines.findBy('id', machine.id)) {
                            if (machine.id != -1) {
                                that.content.removeObject(machine);
                            }
                        }
                    });

                    // Update content

                    machines.forEach(function(machine) {
                        if (that.machineExists(machine.id)) {
                            // Update existing machines
                            var old_machine = that.getMachine(machine.id);
                            for (attr in machine){
                                old_machine.set(attr, machine[attr]);
                            }
                        } else {
                            // Add new machine
                            machine.backend = that.backend;
                            that.content.pushObject(Machine.create(machine));
                        }
                    });

                    that.trigger('onMachineListChange');
                });
            },


            _createMachine: function(machine, key) {
                Ember.run(this, function() {
                    machine.set('pendingCreation', false);
                    key.associate(machine, function(success) {
                        if (success)
                            machine.probe(key.id);
                    });
                    that.trigger('onMachineListChange');
                });
            },


            _updateSelectedMachines: function() {
                Ember.run(this, function() {
                    var newSelectedMachines = [];
                    this.content.forEach(function(machine) {
                        if (machine.selected) newSelectedMachines.push(machine);
                    });
                    this.set('selectedMachines', newSelectedMachines);
                    this.trigger('onSelectedMachinesChange');
                });
            },


            /**
             * 
             *  Observers
             * 
             */

            selectedMachinesObserver: function() {
                Ember.run.once(this, '_updateSelectedMachines');
            }.observes('content.@each.selected')
        });
    }
);
