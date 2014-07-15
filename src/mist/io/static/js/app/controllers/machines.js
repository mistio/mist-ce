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
            failCounter: null,
            addingMachine: null,
            startingMachine: null,
            rebootingMachine: null,
            destroyingMachine: null,
            shutingdownMachine: null,

            /* Let's disable sorting for now
            sortAscending: true,
            sortProperties: ['hasMonitoring', 'probed'],
            */

            /**
             *
             *  Initialization
             *
             */

            init: function () {
                this._super();
                this.set('content', []);
                this.set('loadint', true);
            },


            load: function (machines) {
                this._updateContent(machines);
                this.set('loading', false);
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

                // Don't send dummy key text
                key = Mist.keysController.keyExists(key.id) ? key : null;
                var that = this;
                this.set('addingMachine', true);
                Mist.ajax.POST('backends/' + this.backend.id + '/machines', {
                        'name': name,
                        'key': key ? key.id : null,
                        'size': size.id,
                        'script': script,
                        'image': image.id,
                        'location': location.id,
                        // Linode specific
                        'disk': size.disk,
                        'image_extra': image.extra,
                        // Gce specific
                        'size_name': size.name,
                        'image_name': image.name,
                        'location_name': location.name
                }).success(function (machine) {
                    machine.backend = that.backend;
                    that._createMachine(machine, key, dummyMachine);
                }).error(function (message) {
                    that.removeObject(dummyMachine);
                    Mist.notificationController.timeNotify('Failed to create machine: ' + message, 5000);
                }).complete(function (success, machine) {
                    that.set('addingMachine', false);
                    that.set('onMachineAdd');
                });
            },


            shutdownMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('stopped');
                machine.lockOn('pending');
                this.set('shutingdownMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'stop'
                }).success(function() {
                    //that._shutdownMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to shutdown machine');
                }).complete(function(success) {
                    that.set('shutingdownMachine', false);
                    that.trigger('onMachineShutdown');
                    if (callback) callback(success);
                });
            },


            destroyMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('terminated');
                machine.lockOn('pending');
                this.set('destroyingMachine', true);
                machine.set('beingDestroyed', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'destroy'
                }).success(function() {
                    //that._destroyMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to destory machine');
                }).complete(function(success) {
                    that.set('destroyingMachine', false);
                    machine.set("beingDestroyed",false);
                    that.trigger('onMachineDestroy');
                    if (callback) callback(success);
                });
            },


            rebootMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('running');
                machine.lockOn('rebooting');
                this.set('rebootingMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'reboot'
                }).success(function() {
                    //that.rebootMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to reboot machine');
                }).complete(function(success) {
                    that.set('rebootingMachine', false);
                    that.trigger('onMachineReboot');
                    if (callback) callback(success);
                });
            },


            startMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('running');
                machine.lockOn('pending');
                this.set('startingMachine', true);
                Mist.ajax.POST('/backends/' + this.backend.id + '/machines/' + machineId, {
                    'action' : 'start'
                }).success(function() {
                    //that.startMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to start machine');
                }).complete(function(success) {
                    that.set('startingMachine', false);
                    that.trigger('onMachineStart');
                    if (callback) callback(success);
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


            _updateContent: function(machines) {
                var that = this;
                Ember.run(function() {

                    // Replace dummy machines (newly created)

                    var dummyMachines = that.content.filterBy('id', -1);

                    dummyMachines.forEach(function(machine) {
                        var realMachine = machines.findBy('name', machine.name);
                        if (realMachine)
                            for (var attr in realMachine)
                                machine.set(attr, realMachine[attr]);
                    });

                    // Remove deleted machines

                    that.content.forEach(function(machine) {
                        if (!machines.findBy('id', machine.id))
                            if (machine.id != -1)
                                that.content.removeObject(machine);
                    });

                    // Update content

                    machines.forEach(function(machine) {
                        if (that.machineExists(machine.id)) {

                            // Update existing machines
                            var old_machine = that.getMachine(machine.id);
                            // We save previous state here because it will
                            // be overwritten by the following for loop
                            var prevState = old_machine.state;

                            for (var attr in machine) {

                                // Do not overwrite ips
                                if (attr == 'private_ips') continue;
                                if (attr == 'pubic_ips') continue;
                                old_machine.set(attr, machine[attr]);
                            }

                        } else {

                            // Add new machine
                            machine.backend = that.backend;
                            that.content.pushObject(Machine.create(machine));
                        }
                    });

                    that._updateMonitoredMachines();

                    that.trigger('onMachineListChange');
                });
            },


            _createMachine: function(machine, key, dummyMachine) {
                Ember.run(this, function() {
                    machine = Machine.create(machine);
                    if (machine.state == 'stopped')
                        machine.set('state', 'pending');
                    this.content.pushObject(machine);
                    this.content.removeObject(dummyMachine);
                    Mist.keysController._associateKey(key.id, machine);
                    this.trigger('onMachineListChange');
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


            _updateMonitoredMachines: function() {

                var that = this;

                if (Mist.monitored_machines) {

                    that.content.forEach(function(machine) {

                        Mist.monitored_machines.some(function(machine_tuple){
                            backend_id = machine_tuple[0];
                            machine_id = machine_tuple[1];
                            if (!machine.hasMonitoring &&
                                machine.id == machine_id &&
                                machine.backend.id == backend_id) {
                                    that.getMachine(machine_id, backend_id)
                                        .set('hasMonitoring', true);
                                    return true;
                            }
                        });

                        Mist.rulesController.content.forEach(function(rule) {
                            if (rule.machine.id) return;
                            if (rule.machine == machine.id &&
                                rule.backend == machine.backend.id)
                                    rule.set('machine', machine);
                        });

                        Mist.metricsController.customMetrics.forEach(function(metric) {
                            metric.machines.forEach(function(metricMachine, index) {
                                if (metricMachine[1] == machine.id &&
                                    metricMachine[0] == machine.backend.id) {
                                        metric.machines[index] = machine;
                                        Mist.metricsController.trigger('onMetricListChange');
                                    }
                            });
                        });
                    });
                }
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
