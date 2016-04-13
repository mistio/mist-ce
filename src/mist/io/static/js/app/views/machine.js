define('app/views/machine', ['app/views/page'],
    //
    //  Machine View
    //
    //  @returns Class
    //
    function(PageView) {

        'use strict';

        return App.MachineView = PageView.extend({

            //
            //  Properties
            //

            machine: null,

            //
            //  Initialization
            //

            load: function() {
                Mist.cloudsController.off('onMachineListChange', this, 'load');
                Mist.cloudsController.on('onMachineListChange', this, 'load');
                var that = this;
                Ember.run.next(function() {
                    that.updateCurrentMachine();
                });

            }.on('didInsertElement'),

            unload: function() {
                // Remove event listeners
                Mist.cloudsController.off('onMachineListChange', this, 'load');
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            updateCurrentMachine: function() {
                var that = this;
                Ember.run.next(function() {
                    var machine = Mist.cloudsController.getRequestedMachine();
                    if (machine)
                        that.get('controller').set('model', machine);
                    if (that.isDestroyed)
                        return;

                    that.set('machine', that.get('controller').get('model'));
                    if (that.machine.id) {
                        that.machine.set('keysCount',
                            Mist.keysController.getMachineKeysCount(that.machine)
                        );
                        that.updateUptime();
                    }
                });
            },

            updateMonitoringCollapsible: function() {
                Ember.run.next(this, function() {
                    if (Mist.cloudsController.checkedMonitoring && this.machine.id) {
                        $('#monitoring-collapsible').show();
                    } else {
                        $('#monitoring-collapsible').hide();
                    }
                });
            },

            updateUptime: function() {
                if ($('#single-machine-page').length) {
                    // Rescedule updateUptime
                    Ember.run.later(this, function() {
                        this.updateUptime();
                    }, 1000);

                    // Calculate uptime
                    var machine = this.machine;
                    if (!machine) return 0;
                    if (!machine.uptimeChecked) return 0;
                    if (!machine.uptimeFromServer) return 0;
                    machine.set('uptime', machine.uptimeFromServer + (Date.now() - machine.uptimeChecked));
                }
            },

            renderMetadata: function () {
                Ember.run.next(function() {
                    if ($('#single-machine-metadata').collapsible)
                        $('#single-machine-metadata').collapsible();
                });
            },


            //
            //  Actions
            //

            actions: {
                manageKeysClicked: function() {
                    Mist.machineKeysController.open(this.machine);
                },

                addKeyClicked: function() {
                    Mist.machineKeysController.openKeyList(this.machine);
                },

                tagsClicked: function () {
                    Mist.machineTagsController.open(this.machine);
                },

                powerClicked: function () {
                    Mist.machinePowerController.open(this.machine);
                },

                shellClicked: function () {
                    Mist.machineShellController.open(this.machine);
                },

                deleteMetric: function (metric) {
                    Mist.metricsController.deleteMetric(metric);
                },

                probeClicked: function() {
                    this.machine.probe(null, function(success) {
                        if (!success)
                            Mist.notificationController.notify('Failed to probe machine');
                    });
                }
            },


            //
            //  Computed Properties
            //

            providerIconClass: function() {
                if (!this.machine || !this.machine.cloud || !this.machine.cloud.provider)
                    return '';
                return 'provider-' + this.machine.cloud.getSimpleProvider();
            }.property('machine.cloud.provider'),

            imageIconClass: function () {
                if (!this.machine || !this.machine.extra ||
                    !this.machine.cloud || !this.machine.cloud.provider)
                    return 'image-generic';

                var imageId = this.machine.extra.image_id ||
                    this.machine.extra.imageId ||
                    this.machine.extra.image ||
                    this.machine.extra.os_type ||
                    this.machine.extra.DISTRIBUTIONVENDOR
                    '';

                if (!imageId) return 'image-generic';

                // Use .toString() because digital ocean returns
                // an number instead of a string which breaks the search
                return 'image-' + this.machine.cloud.images.getImageOS(imageId.toString());
            }.property('machine.extra'),

            upFor: function() {
                var ret = '';
                if (this.machine && this.machine.uptime) {
                    var x = Math.floor(this.machine.uptime / 1000);
                    var seconds = x % 60;
                    x = Math.floor(x / 60);
                    var minutes = x % 60;
                    x = Math.floor(x / 60);
                    var hours = x % 24;
                    x = Math.floor(x / 24);
                    var days = x;

                    if (days) ret = ret + days + ' days, ';
                    if (hours) ret = ret + hours + ' hours, ';
                    if (minutes) ret = ret + minutes + ' minutes, ';
                    if (seconds) {
                        ret = ret + seconds + ' seconds';
                    } else {
                        ret = ret + '0 seconds';
                    }
                }
                return ret;
            }.property('machine.uptime'),

            lastProbe: function(){
                var ret = 'never';
                if (this.machine && this.machine.uptimeChecked > 0) {
                    var x = (Date.now()-this.machine.uptimeChecked) / 1000;
                    var minutes = Math.floor(x / 60);
                    if (minutes > 1)
                        ret = minutes + ' minutes ago';
                    else if (minutes == 1)
                        ret = "1 minute ago";
                    else
                        ret = "just now";
                }
                return ret;
            }.property('machine.uptime'),

            basicInfo: function() {
                if (!this.machine) return;

                var basicInfo = {};

                if (this.machine.public_ips instanceof Array) {
                    this.set('public_ips', this.machine.public_ips);
                } else if (typeof this.machine.public_ips == 'string') {
                    this.set('public_ips', [this.machine.public_ips]);
                }

                if (this.machine.cloud.provider != 'docker') {
                    if (this.machine.private_ips instanceof Array) {
                        this.set('private_ips', this.machine.private_ips);
                    } else if (typeof this.machine.public_ips == 'string') {
                        this.set('private_ips', [this.machine.private_ips]);
                    }
                }
                if (this.machine.extra) {
                    if (this.machine.cloud.provider == 'docker') {
                        basicInfo['Image'] = this.machine.extra.image;
                        basicInfo['Status'] = this.machine.extra.status;
                        basicInfo['Command'] = this.machine.extra.command;
                    }
                    if (this.machine.extra.dns_name) {
                        basicInfo['DNS Name'] = this.machine.extra.dns_name;
                    }
                    if (this.machine.extra.launchdatetime) {
                        basicInfo['Launch Date'] = this.machine.extra.launchdatetime;
                    }
                }
                if (this.machine.image && this.machine.image.name) {
                    basicInfo.image = this.machine.image.name;
                }

                var ret = [];
                forIn(basicInfo, function (value, key) {
                    if (typeof value == 'string')
                        ret.push({key:key, value: value});
                });

                sortInfo(ret);
                return ret;

            }.property('machine.public_ips', 'machine.private_ips'),

            metadata: function() {
                if (!this.machine || !this.machine.extra) return;

                var ret = [];
                forIn(this.machine.extra, function (value, key) {
                    if (typeof value == 'string' || typeof value == 'number')
                        ret.push({key:key, value: value});
                });

                this.renderMetadata();
                sortInfo(ret);
                return ret;

            }.property('machine.extra'),


            //
            //  Observers
            //

            modelObserver: function() {
                Ember.run.once(this, 'load');
            }.observes('controller.model'),

            checkedMonitoringObserver: function() {
                Ember.run.once(this, 'updateMonitoringCollapsible');
            }.observes('machine', 'Mist.cloudsController.checkedMonitoring'),
        });

        function sortInfo (array) {
            array.sort(function (a, b) {
                if (a.key > b.key) return 1;
                if (b.key < a.key) return -1;
                return 0;
            });
        }
    }
);
