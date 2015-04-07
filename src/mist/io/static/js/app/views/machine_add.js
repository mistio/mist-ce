define('app/views/machine_add', ['app/views/templated'],
    /**
     *  Machine Add View
     *
     *  @returns Class
     */
    function (TemplatedView) {
        return App.MachineAddView = TemplatedView.extend({

            /**
             *  Properties
             */

            price: function () {

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

             load: function () {

                // Add event listeners
                Mist.scriptsController.on('onChange', this, 'renderFields');
                Mist.keysController.on('onKeyListChange', this, 'renderFields');
                Mist.backendsController.on('onImagesChange', this, 'renderFields');

                // Connect view with machineAddController
                var viewId = $('#create-machine-panel').parent().attr('id');
                Mist.machineAddController.set('view', Ember.View.views[viewId]);

             }.on('didInsertElement'),


             unload: function () {

                // Remove event listeners
                Mist.scriptsController.off('onChange', this, 'renderFields');
                Mist.keysController.off('onKeyListChange', this, 'renderFields');
                Mist.backendsController.off('onImagesChange', this, 'renderFields');

             }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */


             clear: function () {
                 this.$('select').val('basic').slider('refresh');
                 this.$('.script-option').hide();
                 this.$('.basic').show();
             },


             fieldIsReady: function (field) {
                $('#create-machine-' + field).collapsible('option', 'collapsedIcon', 'check')
                                             .collapsible('collapse');
             },


             renderFields: function () {
                Ember.run.next(function () {

                    // Render collapsibles
                    if ($('.ui-collapsible').collapsible) {
                        $('.ui-collapsible').collapsible();
                    }

                    // Render listviews
                    if ($('.ui-listview').listview) {
                        $('.ui-listview').listview()
                                         .listview('refresh');
                    }
                });
             },


            showDockerMenu: function () {
                this.hideDockerMenu();
                $('#create-machine-panel #location').hide();
                $('#create-machine-panel #script').hide();
                $('#create-machine-panel #size').hide();
                $('#create-machine-panel #key').hide();
                $('#create-machine-monitoring').hide();
                $('#create-machine-panel .docker').show();
                $('#create-machine-panel #ports').show();
            },


            showMistDockerMenu: function () {
                this.hideDockerMenu();
                $('#create-machine-panel #location').hide();
                $('#create-machine-panel #size').hide();
                $('#create-machine-panel #ports').show();
            },


            hideDockerMenu: function () {
                $('#create-machine-panel #location').show();
                $('#create-machine-panel #script').show();
                $('#create-machine-panel #size').show();
                $('#create-machine-panel #key').show();
                $('#create-machine-monitoring').show();
                $('#create-machine-panel .docker').hide();
                $('#create-machine-panel #ports').hide();
            },


             updateLaunchButton: function () {
                if (Mist.machineAddController.formReady) {
                    $('#create-machine-ok').removeClass('ui-state-disabled');
                } else {
                    $('#create-machine-ok').addClass('ui-state-disabled');
                }
             },


            /**
             *
             *  Actions
             *
             */

            actions: {

                switchToggled: function () {
                    var value = this.$('#script select').val();
                    this.$('.script-option').hide();
                    this.$('.'+value).show();
                    Mist.machineAddController.set('newMachineScript', '');
                    Mist.machineAddController.set('newMachineScriptParams', '');
                    Mist.machineAddController.set('hasScript', value == 'advanced');
                },


                selectProvider: function (backend) {

                    if (this.fieldIsReady) {
                        this.fieldIsReady('provider');
                    }

                    backend.networks.content.forEach(function (network, index) {
                        network.set('selected', false);
                    });
                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineImage', {'name' : 'Select Image'})
                                             .set('newMachineSize', {'name' : 'Select Size'})
                                             .set('newMachineProvider', backend);

                    $('#create-machine-image').removeClass('ui-state-disabled');
                    $('#create-machine-location').addClass('ui-state-disabled');
                    $('#create-machine-size').addClass('ui-state-disabled');
                    $('#create-machine-key').addClass('ui-state-disabled');
                    $('#create-machine-panel .docker textarea').addClass('ui-state-disabled');
                    $('#create-machine-panel .docker .ui-checkbox').addClass('ui-state-disabled');
                    $('#create-machine-network .ui-collapsible').addClass('ui-state-disabled');
                    $('#create-machine-panel #ports').addClass('ui-state-disabled');

                    if (backend.get('requiresNetworkOnCreation')) {
                        if (backend.networks.content.length > 0) {
                            $('#create-machine-network').show();
                            $('label[for=create-machine-script]').text('Script:');
                        }
                    } else {
                        $('#create-machine-network').hide();
                        $('label[for=create-machine-script]').text('Script:');
                    }

                    var view = Mist.machineAddController.view;
                    if (backend.get('isDocker')) {
                        view.showDockerMenu();
                    } else {
                        view.hideDockerMenu();
                    }
                },


                selectImage: function (image) {

                    if (this.fieldIsReady) {
                        this.fieldIsReady('image');
                    }

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineSize', {'name' : 'Select Size'})
                                             .set('newMachineImage', image);

                   $('#create-machine-location').addClass('ui-state-disabled');
                   $('#create-machine-size').removeClass('ui-state-disabled');
                   $('#create-machine-key').addClass('ui-state-disabled');
                   $('#create-machine-network .ui-collapsible').addClass('ui-state-disabled');

                   var view = Mist.machineAddController.view;
                   if (image.get('isDocker')) {
                       Mist.machineAddController.set('newMachineSize',
                            Mist.machineAddController.newMachineProvider.sizes.content[0]);
                       if (image.get('isMist')) {
                           view.showMistDockerMenu();
                           $('#create-machine-key').removeClass('ui-state-disabled');
                       } else {
                           view.showDockerMenu();
                           $('#create-machine-panel .docker textarea')
                                .removeClass('ui-state-disabled');
                       }
                       $('#create-machine-panel #ports').removeClass('ui-state-disabled');
                   }
                },


                selectSize: function (size) {

                    this.fieldIsReady('size');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineSize', size);

                    $('#create-machine-location').removeClass('ui-state-disabled');
                    $('#create-machine-panel .docker textarea').removeClass('ui-state-disabled');
                    $('#create-machine-panel .docker .ui-checkbox').removeClass('ui-state-disabled');
                    $('#create-machine-key').addClass('ui-state-disabled');
                    $('#create-machine-network .ui-collapsible').addClass('ui-state-disabled');

                    // Docker specific
                    if (Mist.machineAddController.newMachineProvider.provider == 'docker')
                        // Because SSH key is optional for docker, so is location
                        $('#create-machine-key').removeClass('ui-state-disabled');
                },


                selectLocation: function (location) {

                    this.fieldIsReady('location');

                    Mist.machineAddController.set('newMachineLocation', location);
                    $('#create-machine-key').removeClass('ui-state-disabled');
                    $('#create-machine-network .ui-collapsible').addClass('ui-state-disabled');
                },


                selectKey: function (key) {
                    this._selectKey(key)
                },

                selectScript: function (script) {
                    Mist.machineAddController.set('newMachineScript', script);
                    $('#create-machine-script-select').collapsible('collapse');
                },

                toggleNetworkSelection: function (network) {
                    network.set('selected', !network.selected);
                    $('#create-machine-machine')
                        .collapsible('option', 'collapsedIcon', 'check')
                        .collapsible('collapse');
                },


                createKeyClicked: function () {
                    var that = this;
                    Mist.keyAddController.open(function (success, key) {
                        that._selectKey(key);
                    });
                },


                backClicked: function () {
                    Mist.machineAddController.close();
                },


                launchClicked: function () {
                    Mist.machineAddController.add();
                }
            },


            _selectKey: function (key) {

                this.fieldIsReady('key');

                Mist.machineAddController.set('newMachineKey', key);
                $('#script').show();
                $('#create-machine-monitoring').removeClass('ui-state-disabled');
                $('#create-machine-network .ui-collapsible')
                    .removeClass('ui-state-disabled')
                    .parent()
                    .trigger('create')
                    .find('label')
                    .removeClass('ui-corner-all');
            },


            /**
             *
             *  Observers
             *
             */

             bindingsObserver: function () {
                Ember.run.once(this, 'renderFields');
             }.observes('Mist.machineAddController.newMachineSize',
                        'Mist.machineAddController.newMachineImage',
                        'Mist.machineAddController.newMachineProvider',
                        'Mist.machineAddController.newMachineLocation'),


             formReadyObserver: function () {
                Ember.run.once(this, 'updateLaunchButton');
             }.observes('Mist.machineAddController.formReady')
        });
    }
);
