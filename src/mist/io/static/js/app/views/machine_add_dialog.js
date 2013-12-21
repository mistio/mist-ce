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
            imagesBinding: 'Mist.machineAddController.newMachineBackend.images',

            /**
             *
             *  Methods
             *
             */

             yo: function() {
                Ember.run.later(function() {
                    $('#create-machine-provider h3 a').on('click', function() {
                        //return false;
                        //info('yo');
                    })
                    $('#create-machine-provider h3 a').on('click', function() {
                        //info('ya');
                    })
                }, 2000);
             }.on('didInsertElement'),

            /**
             *
             *  Actions
             *
             */

            actions: {

                selectProvider: function(backend) {
                    function select() {
                        // Select backend
                        Mist.machineAddController.set('newMachineProvider', backend);
                        $('#create-machine-provider').collapsible('collapse');
                        $('#create-machine-provider').collapsible('option', 'collapsedIcon', 'check');

                        // Update other fields
                        Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'});
                        Mist.machineAddController.set('newMachineImage', {'name' : 'Select Image'});
                        Mist.machineAddController.set('newMachineSize', {'name' : 'Select Size'});
                        return false;
                    };
                    return select();
                },

                selectImage: function(image) {

                    // Select image
                    Mist.machineAddController.set('newMachineImage', image);
                    $('#create-machine-image').collapsible('collapse');
                    $('#create-machine-image').collapsible('option', 'collapsedIcon', 'check');

                    // Update other fields
                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'});
                    Mist.machineAddController.set('newMachineSize', {'name' : 'Select Size'});
                },

                selectSize: function(size) {

                    // Select size
                    Mist.machineAddController.set('newMachineSize', size);
                    $('#create-machine-size').collapsible('collapse');
                    $('#create-machine-size').collapsible('option','collapsedIcon','check');

                    // Update other fields
                    Mist.machineAddController.set('newMachineLocation', {'name' : 'Select Location'});
                },

                selectLocation: function(location) {

                    // Select location
                    Mist.machineAddController.set('newMachineLocation', location);
                    $('#create-machine-location').collapsible('collapse');
                    $('#create-machine-location').collapsible('option','collapsedIcon','check');
                },

                selectKey: function(key) {
                    Mist.machineAddController.set('newMachineKey', key);
                    $('#create-machine-key').collapsible('collapse');
                    $('#create-machine-key').collapsible('option','collapsedIcon','check');
                },

                backClicked: function() {
                    Mist.machineAddController.close();
                },
            },

            getPrice: function(size, image){
            //return price, for size/image combination for EC2/Rackspace, otherwise just size
            //eg on provider Linode
                if (Mist.machineAddController.newMachineProvider.provider.indexOf('ec2') != -1){
                    if(image.name.indexOf('Red Hat') != -1){
                        return size.price.rhel;
                    } else if(image.name.indexOf('SUSE Linux Enterprise') !=-1 ){
                        return size.price.sles;
                    } else if(image.name.indexOf('SQL Server Web') !=-1 ){
                        return size.price.mswinSQLWeb;
                    } else if(image.name.indexOf('SQL Server') !=-1 ){
                        return size.price.mswinSQL;
                    } else if(image.name.indexOf('Windows') !=-1 ){
                        return size.price.mswin;
                    } else {
                        return size.price.linux;
                    }
                } else if (Mist.machineAddController.newMachineProvider.provider.indexOf('rackspace') != -1) {
                    if(image.name.indexOf('Red Hat') != -1) {
                        return size.price.rhel;
                    } else if(image.name.indexOf('SQL Server Web') !=-1 ) {
                        return size.price.mswinSQLWeb;
                    } else if(image.name.indexOf('SQL Server') !=-1 ) {
                        return size.price.mswinSQL;
                    } else if(image.name.indexOf('Windows') !=-1 ) {
                        return size.price.mswin;
                    } else if(image.name.indexOf('Vyatta') !=-1 ) {
                        return size.price.vyatta;
                    } else {
                        return size.price.linux;
                    }
                } else {
                    return size.price;
                }
            },

            clear: function(){
                Mist.machineAddController.newMachineClear();
                $('.select-provider-collapsible span.ui-btn-text').text('Select Provider');
                $('.select-image-collapsible span.ui-btn-text').text('Select Image');
                $('.select-size-collapsible span.ui-btn-text').text('Select Size');
                $('.select-location-collapsible span.ui-btn-text').text('Select Location');
                $('.select-key-collapsible span.ui-btn-text').text('Select Key');

                $('#create-machine-name').val('');
            },

            didInsertElement: function() {
                var that = this;
                this.$().bind('popupbeforeposition', function(e, data){
                    that.clear();
                });
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
                        Mist.notificationController.timeNotify("Server name in NephoScale must start with a letter, can contain mixed alpha-numeric characters, hyphen ('-') and underscore ('_') characters, cannot exceed 64 characters, and can end with a letter or a number.", 7000);
                        return false;                        
                    } else if (machineSize.indexOf('CS025') != -1) {
                          if (!((machineImage == 'Linux Ubuntu Server 10.04 LTS 64-bit') || (machineImage =='Linux CentOS 6.2 64-bit'))) {
                              Mist.notificationController.timeNotify("On CS025 size you can only create one of the two images: Linux Ubuntu Server 10.04 LTS 64-bit or Linux CentOS 6.2 64-bit", 10000);
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
                        Mist.notificationController.timeNotify("A Linode label may only contain ASCII letters or numbers, dashes, and underscores, must begin and end with letters or numbers, and be at least 3 characters in length.", 7000);
                        return false; 
                    }                       
                }
                if (providerName == 'SoftLayer') {
                    var re = /^[0-9a-zA-Z.-]*$/;
                    if ((machineName.length > 253)||(!(re.test(machineName)))) {              
                        Mist.notificationController.timeNotify("Server name must be an alphanumeric string, that may contain period ('.') and dash ('-') special characters.", 7000);
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


        });
    }
);
