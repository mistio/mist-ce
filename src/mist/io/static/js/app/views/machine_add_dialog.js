define('app/views/machine_add_dialog', ['text!app/templates/machine_add_dialog.html', 'ember'],
    /**
     *  Machine Add View
     *
     *  @returns Class
     */
    function (machine_add_dialog_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(machine_add_dialog_html),
            price: function () {

                var image = Mist.machineAddController.newMachineImage;
                var size = Mist.machineAddController.newMachineSize;
                var provider = Mist.machineAddController.newMachineProvider;

                if (!image || !image.id || !size || !size.id || !provider || !provider.id) return 0;

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
                return size.price;
            }.property('Mist.machineAddController.newMachineProvider',
                       'Mist.machineAddController.newMachineImage',
                       'Mist.machineAddController.newMachineSize'),


            /**
             * 
             *  Initialization
             * 
             */

             load: function () {

                // Add event listeners
                Mist.keysController.on('onKeyListChange', this, 'renderFields');

             }.on('didInsertElement'),


             unload: function () {

                // Remove event listeners
                Mist.keysController.off('onKeyListChange', this, 'renderFields');

             }.on('willDestroyElement'),


            /**
             *
             *  Methods
             *
             */

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


                selectProvider: function (backend) {

                    this.fieldIsReady('provider');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineImage', {'name' : 'Select Image'})
                                             .set('newMachineSize', {'name' : 'Select Size'})
                                             .set('newMachineProvider', backend);
                   
                   $('#create-machine-image').removeClass('ui-state-disabled');
                   $('#create-machine-location').addClass('ui-state-disabled');
                   $('#create-machine-size').addClass('ui-state-disabled');
                   $('#create-machine-key').addClass('ui-state-disabled');
                },


                selectImage: function (image) {

                    this.fieldIsReady('image');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineSize', {'name' : 'Select Size'})
                                             .set('newMachineImage', image);

                   $('#create-machine-location').addClass('ui-state-disabled');
                   $('#create-machine-size').removeClass('ui-state-disabled');
                   $('#create-machine-key').addClass('ui-state-disabled');
                },


                selectSize: function (size) {

                    this.fieldIsReady('size');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineSize', size);
                    
                    $('#create-machine-location').removeClass('ui-state-disabled');
                    $('#create-machine-key').addClass('ui-state-disabled');
                },


                selectLocation: function (location) {

                    this.fieldIsReady('location');

                    Mist.machineAddController.set('newMachineLocation', location);
                    $('#create-machine-key').removeClass('ui-state-disabled');
                },


                selectKey: function (key) {

                    this.fieldIsReady('key');

                    Mist.machineAddController.set('newMachineKey', key);
                },


                createKeyClicked: function () {
                    var that = this;
                    Mist.keyAddController.open(function (success, key) {
                        that.fieldIsReady('key');
                        Mist.machineAddController.set('newMachineKey', key);
                    });
                },


                backClicked: function () {
                    Mist.machineAddController.close();
                },


                launchClicked: function () {
                    Mist.machineAddController.add();
                }
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
