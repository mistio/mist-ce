define('app/views/machine_add_dialog', [
    'text!app/templates/machine_add_dialog.html',
    'ember'],
    /**
     *
     * Machine Add Dialog
     *
     * @returns Class
     */
    function(machine_add_dialog_html) {
        return Ember.View.extend({

            template: Ember.Handlebars.compile(machine_add_dialog_html),

            imagesBinding: 'Mist.machineAddController.newMachineBackend.images',

            openMachineAddDialog: function(){
                var that = this;
                
                $('.select-listmenu').listview('refresh');
                $('.dialog-add').panel('open');
                if (Mist.keysController.content.length > 0) {
                    $('div.create-key').hide();
                    $('#create-key').hide();
                    $('#machines .select-key-collapsible').css('width', '100%');
                }
                // resize dismiss div TODO: reset on window resize
                $('.ui-panel-dismiss-position-right').css('left',(0-$('.ui-panel-position-right.ui-panel-open').width()));        
            },
            
            selectProvider: function(backend){
                $('.select-provider-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-provider-collapsible span.ui-btn-text').text(backend.title);
                Mist.machineAddController.set('newMachineBackend', backend);
                  
                Mist.machineAddController.set('newMachineImage', null);
                $('.select-image-collapsible span.ui-btn-text').text('Select Image');   
                Mist.machineAddController.set('newMachineSize', null);
                Mist.machineAddController.set('newMachineCost', 0);
                $('.cost').css('display', 'none');
                $('.select-size-collapsible span.ui-btn-text').text('Select Size');                           
                Mist.machineAddController.set('newMachineLocation', null);
                $('.select-location-collapsible span.ui-btn-text').text('Select Location');      
                
                $('.select-provider-collapsible').trigger('collapse');                
                return false;
            },
                      
            selectImage: function(image){
                $('.select-image-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-image-collapsible span.ui-btn-text').text(image.name);
                Mist.machineAddController.set('newMachineImage', image);
                
                Mist.machineAddController.set('newMachineSize', null);
                Mist.machineAddController.set('newMachineCost', 0);
                $('.cost').css('display', 'none');
                $('.select-size-collapsible span.ui-btn-text').text('Select Size');  
                                    
                $('.select-image-collapsible').trigger('collapse');
                return false;               
            },
                                                                                                
            getPrice: function(size, image){
            //return price, for size/image combination for EC2/Rackspace, otherwise just size
            //eg on provider Linode
                if (Mist.machineAddController.newMachineBackend.provider.indexOf('ec2') != -1){
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
                } else if (Mist.machineAddController.newMachineBackend.provider.indexOf('rackspace') != -1){
                    if(image.name.indexOf('Red Hat') != -1){
                        return size.price.rhel;
                    } else if(image.name.indexOf('SQL Server Web') !=-1 ){
                        return size.price.mswinSQLWeb;
                    } else if(image.name.indexOf('SQL Server') !=-1 ){
                        return size.price.mswinSQL;
                    } else if(image.name.indexOf('Windows') !=-1 ){
                        return size.price.mswin;
                    } else if(image.name.indexOf('Vyatta') !=-1 ){
                        return size.price.vyatta;                        
                    } else {
                        return size.price.linux;
                    }                    
                } else {return size.price;
                }              
            },
                                   
            selectSize: function(size){
                $('.select-size-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-size-collapsible span.ui-btn-text').text(size.name);
                Mist.machineAddController.set('newMachineSize', size);  
                Mist.machineAddController.set('newMachineCost', this.getPrice(size, Mist.machineAddController.newMachineImage));
                $('.cost').css('display', 'block');                          
                Mist.machineAddController.set('newMachineLocation', null);
                $('.select-location-collapsible span.ui-btn-text').text('Select Location');                     
                $('.select-size-collapsible').trigger('collapse');

                if (Mist.machineAddController.newMachineBackend.locations.content.length == 1){
                    $('.select-location-collapsible').collapsible('option','collapsedIcon','check');
                    $('.select-location-collapsible span.ui-btn-text').text(Mist.machineAddController.newMachineBackend.locations.content[0].name);
                    Mist.machineAddController.set('newMachineLocation', Mist.machineAddController.newMachineBackend.locations.content[0]);
                }
                return false;               
            },

            selectLocation: function(location){
                $('.select-location-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-location-collapsible span.ui-btn-text').text(location.name);
                Mist.machineAddController.set('newMachineLocation', location);      
                $('.select-location-collapsible').trigger('collapse');

                if (Mist.keysController.content.length == 1){
                    $('.select-key-collapsible').collapsible('option','collapsedIcon','check');
                    $('.select-key-collapsible span.ui-btn-text').text(Mist.keysController.content[0].name);
                    Mist.machineAddController.set('newMachineKey', Mist.keysController.content[0]);       
                }                
                return false;               
            },
                        
            selectKey: function(key){
                $('.select-key-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-key-collapsible span.ui-btn-text').text(key.name);
                Mist.machineAddController.set('newMachineKey', key);       
                $('.select-key-collapsible').trigger('collapse');
                return false;               
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
                var machineName = $('#create-machine-name').val();
                if ((providerName == 'NephoScale') && ((machineName.length > 64)||(machineName.indexOf(' ') >= 0))) {
                    Mist.notificationController.timeNotify("Server name in NephoScale must start with a letter, can contain mixed alpha-numeric characters, hyphen ('-') and underscore ('_') characters, cannot exceed 64 characters, and can end with a letter or a number.", 7000);
                } else { 
                    Mist.machineAddController.newMachine();
                    $('.dialog-add').panel('close');
                    Mist.Router.router.transitionTo('machines');
                    this.clear();
                }
            },

            generateKey: function() {
                $('.generate-key-collapsible .ui-icon').hide();
                $('.dialog-add .ajax-loader').show();
                var payload = {
                    'action': 'generate'
                }
                $.ajax({
                    url: '/keys',
                    type: "POST",
                    data: JSON.stringify(payload),
                    contentType: "application/json",
                    headers: { "cache-control": "no-cache" },
                    dataType: "json",
                    success: function(result) {
                        var keyName = 'auto-generated-key-' + Math.round(+new Date/1000);
                        Mist.keysController.newKey(keyName,
                                            result.public,
                                            result.private, true);
                        $('.dialog-add .ajax-loader').css('display','none');
                    }
                });
                return false;
            },

            backClicked: function() {
                this.clear();
                $('div.cost').hide();
                $('.dialog-add').panel('close');
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_add_dialog_html));
                
                var that = this;
                
                Ember.run.next(function(){
                    $('.generate-key-collapsible h2').on('click', that.generateKey);
                    
                    Mist.machineAddController.addObserver('newMachineBackend', function() {
                        Ember.run.next(function() {
                            $('.dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineReady', function() {
                        Ember.run.next(function() {
                            $('#create-ok').button();
                            if (Mist.machineAddController.newMachineReady) {
                                $('#create-machine-ok').button('enable');
                            } else {
                                $('#create-machine-ok').button('disable');
                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineNameReady', function() {
                        Ember.run.next(function(){
                            if (Mist.machineAddController.newMachineNameReady) {
                                $('.select-provider-collapsible').removeClass('ui-disabled');
                                if (Mist.backendsController.content.length == 1){
                                    $('.select-provider-collapsible').collapsible('option','collapsedIcon','check');                                    
                                    $('.select-provider-collapsible span.ui-btn-text').text(Mist.backendsController.content[0].title);
                                    Mist.machineAddController.set('newMachineBackend', Mist.backendsController.content[0]);
                                }
                                                                
                                $('.select-image-collapsible').addClass('ui-disabled');
                                $('.select-size-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-provider-collapsible').addClass('ui-disabled');                                
                                $('.select-image-collapsible').addClass('ui-disabled');
                                $('.select-size-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('.dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineBackendReady', function() {       
                        Ember.run.next(function(){
                            if (Mist.machineAddController.newMachineBackendReady) {
                                $('.select-image-collapsible').removeClass('ui-disabled');

                                $('.select-size-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-image-collapsible').addClass('ui-disabled');
                                $('.select-size-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('.dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });
                    
                    Mist.machineAddController.addObserver('newMachineImageReady', function() {
                        Ember.run.next(function(){
                            if (Mist.machineAddController.newMachineImageReady) {
                                $('.select-size-collapsible').removeClass('ui-disabled');

                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-size-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('.dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });
                    
                    Mist.machineAddController.addObserver('newMachineSizeReady', function() {
                        Ember.run.next(function(){
                            if (Mist.machineAddController.newMachineSizeReady) {
                                $('.select-location-collapsible').removeClass('ui-disabled');

                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('.dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineLocationReady', function() {
                        Ember.run.next(function(){
                            if (Mist.machineAddController.newMachineLocationReady) {
                                $('.select-key-collapsible').removeClass('ui-disabled');
                                $('.generate-key-collapsible').removeClass('ui-disabled');
                                $('#create-machine-script').textinput('enable');
                                $('#create-key').button('enable');
                            } else {
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('.generate-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('enable');
                                $('#create-key').button('disable');     
                            }
                        });
                    });
                    
                    Mist.machineAddController.addObserver('newMachineKeyReady', function() {
                        Ember.run.next(function(){
                            if (Mist.machineAddController.newMachineKeyReady) {
                                $('#create-machine-ok').button('enable');
                            } else {
                                $('#create-machine-ok').button('disable');
                            }
                        });
                    });                    
                });
            },
        });
    }
);
