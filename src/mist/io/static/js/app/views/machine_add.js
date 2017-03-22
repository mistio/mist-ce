define('app/views/machine_add', ['app/views/controlled'],
    /**
     *  Machine Add View
     *
     *  @returns Class
     */
    function(ControlledComponent) {
        return App.MachineAddComponent = ControlledComponent.extend({

            layoutName: 'machine_add',
            controllerName: 'machineAddController',

            changeProviderFlag: false,
            hasAdvancedScript: false,

            hasLibvirt: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider && provider.provider == 'libvirt' ? true : false) : false;
            }),

            hasDocker: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider && provider.provider == 'docker' ? true : false) : false;
            }),

            hasOpenstack: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider && provider.provider == 'openstack' ? true : false) : false;
            }),

            hasAzure: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider && provider.provider == 'azure' ? true : false) : false;
            }),

            hasPacket: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider && provider.provider == 'packet' ? true : false) : false;
            }),

            hasSoftlayer: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider && provider.provider == 'softlayer' ? true : false) : false;
            }),

            hasKey: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider;
                return provider ? (provider.provider ? true : false) : false;
            }),

            dockerNeedsKey: Ember.computed('Mist.machineAddController.newMachineImage', 'hasDocker', function() {
                var image = Mist.machineAddController.newMachineImage;
                return this.get('hasDocker') && (image.id && image.get('isMist')) ? true : false;
            }),

            dockerOptionalCommand: Ember.computed('Mist.machineAddController.newMachineImage', 'hasDocker', function() {
                var image = Mist.machineAddController.newMachineImage;
                return this.get('hasDocker') && (image.id && !image.get('isMist')) ? true : false;
            }),

            needsKey: Ember.computed('hasKey', 'hasLibvirt', 'hasDocker', 'dockerNeedsKey', function() {
                return this.get('hasKey') && ((!this.get('hasDocker') && !this.get('hasLibvirt')) || (this.get('hasDocker') && this.get('dockerNeedsKey')));
            }),

            hasCloudInit: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider,
                    valids = ['openstack', 'azure', 'digitalocean', 'packet', 'gce', 'rackspace', 'rackspace_first_gen', 'vultr', 'libvirt'];
                return provider ? (provider.provider ? ((valids.indexOf(provider.provider) != -1 || provider.provider.indexOf('ec2') > -1) ? true : false) : false) : false;
            }),

            hasScript: Ember.computed('hasKey', 'hasDocker', 'dockerOptionalCommand', function() {
                return this.get('hasKey') && (!this.get('hasDocker') || this.get('dockerOptionalCommand'));
            }),

            hasLocation: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider,
                    invalids = ['docker', 'indonesiancloud', 'vcloud', 'libvirt'];
                return provider ? (provider.provider ? ((invalids.indexOf(provider.provider) != -1 || provider.locations.model.length == 1) ? false : true) : false) : false;
            }),

            hasNetworks: Ember.computed('Mist.machineAddController.newMachineProvider', function() {
                var provider = Mist.machineAddController.newMachineProvider,
                    valids = ['openstack', 'hpcloud', 'vcloud', 'libvirt'];
                return provider ? (provider.provider ? ((valids.indexOf(provider.provider) != -1 && provider.networks.model.length) ? true : false) : false) : false;
            }),

            hasMonitoring: Ember.computed(function() {
                return Mist.email ? true : false;
            }),

            // We check here if it is Bare Metal or not
            newMachineProviderTypeOptions: [{
                title: 'Bare Metal',
                val: true
            }, {
                title: 'Virtual Cloud Server',
                val: false
            }],

            // We check here if it is Hourly or not
            newMachineBillingOptions: [{
                title: 'Hourly',
                val: true
            }, {
                title: 'Monthly',
                val: false
            }],

            helpOptions: [{
                field: 'disk-path',
                helpText: 'Where the VM disk file will be created',
                helpHref: 'http://docs.mist.io/article/99-managing-kvm-with-mist-io'
            }, {
                field: 'disk-size',
                helpText: "The VM's size will be the size of the image plus the number in GBs provided here",
                helpHref: 'http://docs.mist.io/article/99-managing-kvm-with-mist-io'
            }, {
                field: 'key',
                helpText: 'Αn ssh key to deploy if using a cloudinit based Linux image',
                helpHref: 'http://docs.mist.io/article/99-managing-kvm-with-mist-io'
            }, {
                field: 'image',
                helpText: 'Α disk image to be used as the base for the VM, or an .iso image to create a VM from',
                helpHref: 'http://docs.mist.io/article/99-managing-kvm-with-mist-io'
            }],

            helpText: '',
            helpHref: '',


            /**
             *  Properties
             */

            price: function() {

                var image = Mist.machineAddController.newMachineImage;
                var size = Mist.machineAddController.newMachineSize;
                var provider = Mist.machineAddController.newMachineProvider;
                var location = Mist.machineAddController.newMachineLocation;

                if (!image || !image.id || !size || !size.id || !provider || !provider.id) return 0;

                try { //might fail with TypeError if no size for this image
                    if (provider.provider.indexOf('ec2') > -1) {
                        if (image.name.indexOf('SUSE Linux Enterprise') > -1)
                            return size.price.sles;
                        if (image.name.indexOf('Red Hat') > -1)
                            return size.price.rhel;
                        return size.price.linux;
                    }
                    if (provider.provider.indexOf('rackspace') > -1) {
                        if (image.name.indexOf('Red Hat') > -1)
                            return size.price.rhel;
                        if (image.name.indexOf('Vyatta') > -1)
                            return size.price.vyatta;
                        return size.price.linux;
                    }
                    if (provider.provider.indexOf('gce') > -1) {
                        if (location.name.indexOf('europe-') > -1)
                            return size.price.eu;
                        if (location.name.indexOf('us-') > -1)
                            return size.price.us;
                        if (location.name.indexOf('asia-') > -1)
                            return size.price.as;
                        return size.price.eu;
                    }
                    return size.price;

                } catch (error) {
                    return 0;
                }
            }.property('Mist.machineAddController.newMachineProvider',
                'Mist.machineAddController.newMachineImage',
                'Mist.machineAddController.newMachineSize',
                'Mist.machineAddController.newMachineLocation'),


            /**
             *
             *  Initialization
             *
             */

            load: function() {
                Ember.run.next(function() {
                    $("#create-machine").collapsible({
                        expand: function(event, ui) {
                            Mist.machineAddController.open(null);

                            var id = $(this).attr('id'),
                                overlay = id ? $('#' + id + '-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('ui-screen-hidden').addClass('in');
                            }
                            $(this).children().next().hide();
                            $(this).children().next().slideDown(250);
                        }
                    });
                });

                // Add event listeners
                Mist.scriptsController.on('onChange', this, 'renderFields');
                Mist.keysController.on('onKeyListChange', this, 'renderFields');
                Mist.cloudsController.on('onImagesChange', this, 'renderFields');

            }.on('didInsertElement'),


            unload: function() {
                Ember.run.next(function() {
                    $("#create-machine").collapsible({
                        collapse: function(event, ui) {
                            $(this).children().next().slideUp(250);
                            var id = $(this).attr('id'),
                                overlay = id ? $('#' + id + '-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('in').addClass('ui-screen-hidden');
                            }
                        }
                    });
                });

                // Remove event listeners
                Mist.scriptsController.off('onChange', this, 'renderFields');
                Mist.keysController.off('onKeyListChange', this, 'renderFields');
                Mist.cloudsController.off('onImagesChange', this, 'renderFields');

            }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */


            clear: function() {
                this.$('select').val('basic').slider('refresh');
                this.$('.ui-collapsible').removeClass('selected');
                this.setProperties({
                    changeProviderFlag: false,
                    hasAdvancedScript: false
                });
                $('#create-machine-floating-ip .ui-checkbox > .ui-btn')
                    .removeClass('ui-checkbox-off')
                    .addClass('ui-checkbox-on');
            },

            checkImageSelected: function(image) {
                if (image) {
                    this.triggerAction({
                        action: 'selectProvider',
                        target: this,
                        actionContext: image.cloud
                    });

                    this.triggerAction({
                        action: 'selectImage',
                        target: this,
                        actionContext: image
                    });
                }
            },

            fieldIsReady: function(field) {
                $('#create-machine')
                    .find('.ui-collapsible')
                    .collapsible()
                    .collapsible('collapse');
                $('#create-machine-' + field).addClass('selected');
            },


            renderFields: function() {
                Ember.run.schedule('afterRender', this, function() {

                    // Render collapsibles
                    if ($('.ui-collapsible').collapsible) {
                        $('.ui-collapsible').collapsible().enhanceWithin();
                    }

                    // Render listviews
                    if ($('.ui-listview').listview) {
                        $('.ui-listview').listview().listview('refresh');
                    }

                    // Render checkboxes
                    if ($('.ember-checkbox').checkboxradio) {
                        $('.ember-checkbox').checkboxradio().checkboxradio('refresh');
                    }
                });
            },


            /**
             *
             *  Actions
             *
             */

            actions: {

                clickOverlay: function() {
                    $('#create-machine').collapsible('collapse');
                },

                switchToggled: function() {
                    var value = this.$('#script select').val();
                    Mist.machineAddController.set('newMachineScript', '');
                    Mist.machineAddController.set('newMachineScriptParams', '');
                    Mist.machineAddController.set('hasScript', value == 'advanced');
                    this.set('hasAdvancedScript', value == 'advanced');
                    this.renderFields();
                },

                createLibvirtImage: function() {
                    var that = this;
                    Mist.machineImageCreateController.open(function(newImagePath) {
                        if (newImagePath) {
                            var imageFaker = Ember.Object.create({
                                id: newImagePath,
                                name: newImagePath
                            });

                            Mist.machineAddController.setProperties({
                                'newMachineImage': imageFaker,
                                'newMachineLibvirtImagePath': newImagePath
                            });

                            that.fieldIsReady('image');
                        }
                    });
                },


                selectProvider: function(cloud) {

                    if (this.fieldIsReady) {
                        this.fieldIsReady('provider');
                    }

                    cloud.networks.model.forEach(function(network, index) {
                        network.set('selected', false);
                    });
                    Mist.machineAddController
                        .set('newMachineLocation', {
                            'name': 'Select Location'
                        })
                        .set('newMachineImage', {
                            'name': 'Select Image'
                        })
                        .set('newMachineSize', {
                            'name': 'Select Size'
                        })
                        .set('newMachineProvider', cloud);

                    // Check we are not on single image page
                    if (!Mist.machineAddController.get('selectedImage')) this.set('changeProviderFlag', true);
                },


                selectProviderType: function(type) {
                    this.fieldIsReady('provider-type');

                    var selectedType = this.get('newMachineProviderTypeOptions')
                        .filter(function(option) {
                            return option.val == type;
                        })
                        .shift();

                    Mist.machineAddController
                        .set('newMachineProviderType', selectedType)
                        .set('newMachineImage', {
                            'name': 'Select Image'
                        })
                        .set('newMachineSize', {
                            'name': 'Select Size'
                        });
                },

                selectProviderBilling: function(type) {
                    this.fieldIsReady('billing');

                    var selectedBilling = this.get('newMachineBillingOptions')
                        .filter(function(option) {
                            return option.val == type;
                        })
                        .shift();

                    Mist.machineAddController.set('newMachineBilling', selectedBilling);
                },

                selectImage: function(image) {
                    if (this.fieldIsReady) {
                        this.fieldIsReady('image');
                    }

                    Mist.machineAddController
                        .set('newMachineLocation', {
                            'name': 'Select Location'
                        })
                        .set('newMachineSize', {
                            'name': 'Select Size'
                        })
                        .set('newMachineImage', image);
                },


                selectSize: function(size) {
                    this.fieldIsReady('size');

                    Mist.machineAddController
                        .set('newMachineLocation', {
                            'name': 'Select Location'
                        })
                        .set('newMachineSize', size);
                },


                selectLocation: function(location) {
                    this.fieldIsReady('location');

                    Mist.machineAddController.set('newMachineLocation', location);
                },


                selectKey: function(key) {
                    this._selectKey(key)
                },


                selectProject: function(project) {
                    this.fieldIsReady('project');

                    Mist.machineAddController.set('newMachineProject', project);
                },


                selectScript: function(script) {
                    Mist.machineAddController.set('newMachineScript', script);
                    $('#create-machine-script-select').collapsible().collapsible('collapse');
                },


                toggleNetworkSelection: function(network) {
                    network.set('selected', !network.selected);
                },


                createKeyClicked: function() {
                    var that = this;
                    Mist.keyAddController.open(function(success, key) {
                        that._selectKey(key);
                    });
                },


                backClicked: function() {
                    Mist.machineAddController.close();
                },


                launchClicked: function() {
                    Mist.machineAddController.add();
                },

                helpClicked: function(field) {
                    var helper = this.get('helpOptions').findBy('field', field);
                    this.setProperties({
                        helpText: helper.helpText,
                        helpHref: helper.helpHref
                    });

                    Ember.run.schedule('afterRender', this, function() {
                        $('#help-tooltip').popup().popup('option', 'positionTo', '#create-machine-' + field + '-helper');
                        $('#help-tooltip').popup('open');
                    });
                }
            },


            _selectKey: function(key) {
                this.fieldIsReady('key');

                Mist.machineAddController.set('newMachineKey', key);
            },


            /**
             *
             *  Observers
             *
             */

            monitoringObserver: function() {
                Ember.run.once(this, 'renderFields');
            }.observes('Mist.machineAddController.newMachineMonitoring'),

            bindingsObserver: function() {
                Ember.run.once(this, 'renderFields');
            }.observes('Mist.machineAddController.newMachineSize',
                'Mist.machineAddController.newMachineImage',
                'Mist.machineAddController.newMachineProvider',
                'Mist.machineAddController.newMachineProviderType',
                'Mist.machineAddController.newMachineLocation'),

            providerObserver: function() {
                Ember.run.once(this, function() {
                    if (this.changeProviderFlag) Mist.machineAddController._resetProvider();
                });
            }.observes('Mist.machineAddController.newMachineProvider'),

            networksObserver: function() {
                Ember.run.once(this, function() {
                    if (this.get('hasOpenstack')) {
                        if (Mist.machineAddController.newMachineProvider.networks.model.filterBy('selected', true).length) {
                            $('#create-machine-floating-ip').slideDown();
                        } else {
                            $('#create-machine-floating-ip').slideUp();
                        }
                    }
                });
            }.observes('hasOpenstack', 'Mist.machineAddController.newMachineProvider.networks.model.@each.selected')
        });
    }
);
