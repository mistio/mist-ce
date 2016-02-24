define('app/controllers/machines', ['app/models/machine'],
    /**
     *  Machines Controller
     *
     *  @returns Class
     */
    function(Machine) {
        return Ember.Controller.extend(Ember.Evented, {

            //
            //  Properties
            //

            model: [],
            loading: null,
            cloud: null,
            failCounter: null,
            addingMachine: null,
            startingMachine: null,
            rebootingMachine: null,
            undefiningMachine: null,
            resumingMachine: null,
            suspendingMachine: null,
            destroyingMachine: null,
            shutingdownMachine: null,

            //
            //  Initialization
            //

            init: function () {
                this._super();
                this.set('model', []);
                this.set('loading', true);
            },

            load: function (machines) {
                this._updateModel(machines);
                this.set('loading', false);
            },


            //
            //  Methods
            //


            newMachine: function(provider, name, image, size, location, key, cloud_init, script, project, monitoring, associateFloatingIp,
                dockerEnv, dockerCommand, scriptParams, dockerPorts, azurePorts, libvirtDiskSize, libvirtDiskPath, libvirtImagePath) {
                // Create a fake machine model for the user
                // to see until we get the real machine from
                // the server
                var dummyMachine = Machine.create({
                    'state': 'pending',
                    'cloud': this.cloud,
                    'name': name,
                    'image': image,
                    'id': -1,
                    'pendingCreation': true
                });

                this.model.addObject(dummyMachine);

                // Don't send dummy key text
                key = Mist.keysController.keyExists(key.id) ? key : null;
                var that = this;

                // Construct array of network ids for openstack
                var networks = [];
                this.cloud.networks.model.forEach(function (network) {
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

                Mist.ajax.POST('clouds/' + this.cloud.id + '/machines', {
                        'provider': provider,
                        'name': name,
                        'key': key ? key.id : null,
                        'size': size.id,
                        'cloud_init': cloud_init,
                        'script': script.id ? undefined : script,
                        'script_id': script.id || undefined,
                        'script_params': scriptParams,
                        'image': image.id,
                        'location': location.id,
                        //Packet.net
                        'project': project.id || undefined,
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
                        'associate_floating_ip': associateFloatingIp,
                        // Docker
                        'docker_env': environment,
                        'docker_command': dockerCommand,
                        'docker_exposed_ports': exposedPorts,
                        'docker_port_bindings': portBindings,
                        'azure_port_bindings': azurePorts,
                        //Libvirt
                        'libvirt_disk_size': libvirtDiskSize,
                        'libvirt_disk_path': libvirtDiskPath,
                        'libvirt_image_path': libvirtImagePath
                }).success(function (machine) {
                    machine.cloud = that.cloud;
                    // Nephoscale returns machine id on request success,
                    // but the machine is not listed on the next list_machines.
                    // This makes the machine dissappear from the UI.
                    if (that.cloud.provider != 'nephoscale')
                        that._createMachine(machine, key, dummyMachine);
                    else
                        dummyMachine.set('pendingCreation', false);
                }).error(function (message) {
                    that.model.removeObject(that.model.findBy('name', name));
                    Mist.notificationController.timeNotify('Failed to create machine: ' + message, 5000);
                }).complete(function (success, machine) {
                    that.set('addingMachine', false);
                    that.set('onMachineAdd');
                });
            },

            shutdownMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);

                // Be careful libvirt machines go to 'terminated'
                // while others to 'stopped' state
                machine.waitFor(machine.cloud.provider == 'libvirt' ? 'terminated' : 'stopped');
                machine.lockOn('pending');
                this.set('shutingdownMachine', true);
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
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
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
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
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
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

            undefineMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('undefined');
                machine.lockOn('pending');
                this.set('undefiningMachine', true);
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
                    'action' : 'undefine'
                }).success(function() {
                    //that._destroyMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to undefine machine');
                }).complete(function(success) {
                    that.set('undefiningMachine', false);
                    that.trigger('onMachineUndefine');
                    if (callback) callback(success);
                });
            },

            suspendMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('suspended');
                machine.lockOn('pending');
                this.set('suspendingMachine', true);
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
                    'action' : 'suspend'
                }).success(function() {
                    //that._destroyMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to suspend machine');
                }).complete(function(success) {
                    that.set('suspendingMachine', false);
                    if (callback) callback(success);
                });
            },

            resumeMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('running');
                machine.lockOn('pending');
                this.set('resumingMachine', true);
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
                    'action' : 'resume'
                }).success(function() {
                    //that.startMachine(machineId);
                }).error(function() {
                    machine.restoreState();
                    Mist.notificationController.notify('Failed to resume machine');
                }).complete(function(success) {
                    that.set('resumingMachine', false);
                    if (callback) callback(success);
                });
            },

            startMachine: function(machineId, callback) {
                var that = this;
                var machine = this.getMachine(machineId);
                machine.waitFor('running');
                machine.lockOn('pending');
                this.set('startingMachine', true);
                Mist.ajax.POST('/clouds/' + this.cloud.id + '/machines/' + machineId, {
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
                return this.model.findBy('id', machineId);
            },

            machineExists: function(machineId) {
                return !!this.getMachine(machineId);
            },


            //
            //  Pseudo-Private Methods
            //

            _updateModel: function(machines) {
                var that = this;
                Ember.run(function() {
                    // Replace dummy machines (newly created)
                    var dummyMachines = that.model.filterBy('id', -1);

                    dummyMachines.forEach(function(machine) {
                        var realMachine = machines.findBy('name', machine.name);
                        if (realMachine)
                            for (var attr in realMachine)
                                machine.set(attr, realMachine[attr]);
                    });

                    // Remove deleted machines
                    that.model.forEach(function(machine) {
                        if (!machines.findBy('id', machine.id))
                            if (machine.id != -1)
                                that.model.removeObject(machine);
                    });

                    // Update model
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
                            machine.cloud = that.cloud;
                            that.model.pushObject(Machine.create(machine));
                        }
                    });

                    that._updateMonitoredMachines();
                    Mist.cloudsController._updateMachines();
                    that.trigger('onMachineListChange');
                });
            },

            _createMachine: function(machine, key, dummyMachine) {
                Ember.run(this, function() {
                    machine = Machine.create(machine);
                    if (machine.state == 'stopped')
                        machine.set('state', 'pending');
                    this.model.addObject(machine);
                    this.model.removeObject(dummyMachine);
                    if (key && key.id)
                        Mist.keysController._associateKey(key.id, machine);
                    this.trigger('onMachineListChange');
                });
            },

            _updateSelectedMachines: function() {
                Ember.run(this, function() {
                    var newSelectedMachines = [];
                    this.model.forEach(function(machine) {
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
                    Mist.rulesController.model.forEach(function (rule) {
                        if (rule.machine && rule.machine.id) return;
                        if (machine.equals([rule.cloud, rule.machine]))
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


            //
            //  Observers
            //

            selectedMachinesObserver: function() {
                Ember.run.once(this, '_updateSelectedMachines');
            }.observes('model.@each.selected')
        });
    }
);
