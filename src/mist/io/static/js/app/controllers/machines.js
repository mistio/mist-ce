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

            newMachine: function(name, image, size, location, key, script, monitoring,
                dockerEnv, dockerCommand, scriptParams, dockerPorts) {

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

                // Construct array of network ids for openstack
                var networks = [];
                this.backend.networks.content.forEach(function (network) {
                    if (network.selected)
                        networks.push(network.id);
                });

                // Construct docerEnv dict
                var environment = null;
                if (dockerEnv.length) {
                    environment = {};
                    dockerEnv.split('\n').forEach(function (definition) {
                        definition = definition.split('=');
                        environment[definition[0]] = definition[1];
                    });
                }

                // Construct docker port bindings
                if (dockerPorts.length) {
                    var portBindings = {};
                    var exposedPorts = {};
                    dockerPorts.split('\n').forEach(function (line) {
                        var vars = line.split(':');
                        var key = vars[1] + '/tcp';
                        portBindings[key] = [{'HostPort': vars[0]}];
                        exposedPorts[key] = {};
                    });
                }


                this.set('addingMachine', true);
                Mist.ajax.POST('backends/' + this.backend.id + '/machines', {
                        'name': name,
                        'key': key ? key.id : null,
                        'size': size.id,
                        'script': script.id ? undefined : script,
                        'script_id': script.id || undefined,
                        'script_params': scriptParams,
                        'image': image.id,
                        'location': location.id,
                        // Linode specific
                        'disk': size.disk,
                        'image_extra': image.extra,
                        // Gce specific
                        'size_name': size.name,
                        'image_name': image.name,
                        'location_name': location.name,
                        'monitoring' : monitoring,
                        // Openstack
                        'networks': networks,
                        // Docker
                        'docker_env': environment,
                        'docker_command': dockerCommand,
                        'docker_exposed_ports': exposedPorts,
                        'docker_port_bindings': portBindings
                }).success(function (machine) {
                    machine.backend = that.backend;
                    // Nephoscale returns machine id on request success,
                    // but the machine is not listed on the next list_machines.
                    // This makes the machine dissappear from the UI.
                    if (that.backend.provider != 'nephoscale')
                        that._createMachine(machine, key, dummyMachine);
                    else
                        dummyMachine.set('pendingCreation', false);
                }).error(function (message) {
                    that.content.removeObject(that.content.findBy('name', name));
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
                    Mist.notificationController.notify('Failed to destroy machine');
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
                    this.content.addObject(machine);
                    this.content.removeObject(dummyMachine);
                    if (key && key.id)
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

                forIn(this, Mist.monitored_machines_, function (machineDict, uuid) {

                    var machine = this.getMachine(machineDict.machine_id);
                    if (!machine) return;

                    machine.set('hasMonitoring', true);

                    // Inject installation status on machine
                    forIn(machineDict.installation_status, function (value, property) {
                        machine.installationStatus.set(property, value);
                    });

                    // Pass machine reference to rules
                    Mist.rulesController.forEach(function (rule) {
                        if (rule.machine.id) return;
                        if (machine.equals([rule.backend, rule.machine]))
                            rule.set('machine', machine);
                    });

                    // Pass machine reference to metrics
                    Mist.metricsController.customMetrics.forEach(function (metric) {
                        metric.machines.forEach(function (metricMachine, index) {
                            if (machine.equals(metricMachine)) {
                                metric.machines[index] = machine;
                                Mist.metricsController.trigger('onMetricListChange');
                            }
                        });
                    });
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
