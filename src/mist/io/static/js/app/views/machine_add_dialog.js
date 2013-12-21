define('app/views/machine_add_dialog', ['text!app/templates/machine_add_dialog.html', 'ember'],
    /**
     *  Machine Add Panel
     *
     *  @returns Class
     */
    function(machine_add_dialog_html) {
        return Ember.View.extend({

            /**
             *  Properties
             */

            template: Ember.Handlebars.compile(machine_add_dialog_html),
            price: function() {

                var image = Mist.machineAddController.newMachineImage;
                var size = Mist.machineAddController.newMachineSize;
                var provider = Mist.machineAddController.newMachineProvider;

                if (!image || !image.id || !size || !size.id || !provider || !provider.id) return 0;

                if (provider.provider.indexOf('ec2') > -1) {
                    if(image.name.indexOf('SUSE Linux Enterprise') > -1) return size.price.sles;
                    if(image.name.indexOf('Red Hat') > -1)               return size.price.rhel;
                                                                         return size.price.linux;
                }
                if (provider.provider.indexOf('rackspace') > -1) {
                    if(image.name.indexOf('Red Hat') > -1) return size.price.rhel;
                    if(image.name.indexOf('Vyatta') > -1)  return size.price.vyatta;
                                                           return size.price.linux;
                } 
                return size.price;
            }.property('Mist.machineAddController.newMachineProvider',
                       'Mist.machineAddController.newMachineImage',
                       'Mist.machineAddController.newMachineSize'),

            /**
             *
             *  Methods
             *
             */

             fieldIsReady: function(field) {
                $('#create-machine-' + field).collapsible('option', 'collapsedIcon', 'check')
                                             .collapsible('collapse');
             },


             renderFields: function() {
                Ember.run.next(function() {

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



            /**
             *
             *  Actions
             *
             */

            actions: {

                selectProvider: function(backend) {

                    this.fieldIsReady('provider');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineImage', {'name' : 'Select Image'})
                                             .set('newMachineSize', {'name' : 'Select Size'})
                                             .set('newMachineProvider', backend);
                },

                selectImage: function(image) {

                    this.fieldIsReady('image');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineSize', {'name' : 'Select Size'})
                                             .set('newMachineImage', image);
                },

                selectSize: function(size) {

                    this.fieldIsReady('size');

                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'})
                                             .set('newMachineSize', size);
                },

                selectLocation: function(location) {

                    this.fieldIsReady('location');

                    Mist.machineAddController.set('newMachineLocation', location);
                },

                selectKey: function(key) {

                    this.fieldIsReady('key');

                    Mist.machineAddController.set('newMachineKey', key);
                },

                backClicked: function() {
                    Mist.machineAddController.close();
                },
            },


            newMachineClicked: function() {
                //FIXME there should be a way to bind the action directly to the controller
                var providerName = $('.select-provider-collapsible span.ui-btn-text').text();
                var machineSize = $('.select-size-collapsible span.ui-btn-text').text();                
                var machineImage = $('.select-image-collapsible span.ui-btn-text').text();                                
                var machineName = $('#create-machine-name').val();                                
                if (providerName == 'NephoScale') {
                    var re = /^[0-9a-zA-Z-_]*$/;                 
                    if ((machineName.length > 64)||(!(re.test(machineName)))) {
                        Mist.notificationController.timeNotify("Server name in NephoScale must start with a letter," + 
                            " can contain mixed alpha-numeric characters, hyphen ('-') and underscore ('_') characters," + 
                            " cannot exceed 64 characters, and can end with a letter or a number.", 7000);
                        return false;                        
                    } else if (machineSize.indexOf('CS025') != -1) {
                          if (!((machineImage == 'Linux Ubuntu Server 10.04 LTS 64-bit') || 
                              (machineImage =='Linux CentOS 6.2 64-bit'))) {
                                Mist.notificationController.timeNotify("On CS025 size you can only create one of the two images:" + 
                                        " Linux Ubuntu Server 10.04 LTS 64-bit or Linux CentOS 6.2 64-bit", 10000);
                                return false;                                                      
                          }
                    }                                         
                } 
                if (providerName == 'DigitalOcean') {                
                    var re = /^[0-9a-zA-Z-.]*$/; 
                    if (!re.test(machineName)) {
                        Mist.notificationController.timeNotify("Characters allowed are a-z, A-Z, 0-9, . and -", 7000);
                        return false; 
                    }                       
                }
                if (providerName == 'Linode') {                
                    var re = /^[0-9a-zA-Z-_]*$/; 
                    if (!re.test(machineName)) {
                        Mist.notificationController.timeNotify("A Linode label may only contain ASCII letters or numbers," + 
                        " dashes, and underscores, must begin and end with letters or numbers, and be at least 3 characters in length.", 7000);
                        return false; 
                    }                       
                }
                if (providerName == 'SoftLayer') {
                    var re = /^[0-9a-zA-Z.-]*$/;
                    if ((machineName.length > 253)||(!(re.test(machineName)))) {              
                        Mist.notificationController.timeNotify("Server name must be an alphanumeric string," + 
                        " that may contain period ('.') and dash ('-') special characters.", 7000);
                        return false;
                    }
                }              
                Mist.machineAddController.newMachine();
                $('.dialog-add').panel('close');
                Mist.Router.router.transitionTo('machines');
                this.clear();                
            },

            generateClicked: function() {
                info('yo');
                return;
                $('.generate-key-collapsible').addClass('ui-disabled');
                $('.generate-key-collapsible .ui-icon').hide();
                $('.dialog-add .ajax-loader').show();
                $.ajax({
                    url: '/keys',
                    type: 'POST',
                    success: function(data) {
                        var keyName = 'auto-generated-key-' + Math.round(+new Date/1000);
                        Mist.keysController.newKey(keyName, data.priv, null, true);
                        $('.dialog-add .ajax-loader').css('display','none');
                        $('.generate-key-collapsible').removeClass('ui-disabled');
                    },
                    error: function(jqXHR, textstate, errorThrown) {
                        Mist.notificationController.notify('Error while generating key');
                        error(textstate, errorThrown, ' while getting public key. ', jqXHR.responseText);
                        $('.generate-key-collapsible').removeClass('ui-disabled');
                    }
                });
                return false;
            },



            /**
             *
             *  Observers
             *
             */

             bindingsObserver: function() {
                Ember.run.once(this, 'renderFields');
             }.observes('Mist.keysController.content',
                        'Mist.machineAddController.newMachineSize',
                        'Mist.machineAddController.newMachineImage',
                        'Mist.machineAddController.newMachineProvider',
                        'Mist.machineAddController.newMachineLocation')

        });
    }
);
