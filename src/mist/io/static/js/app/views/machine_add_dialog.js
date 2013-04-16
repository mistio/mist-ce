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
                $('.select-size-collapsible span.ui-btn-text').text('Select Size');  
                                    
                $('.select-image-collapsible').trigger('collapse');
                return false;               
            },
                        
            selectSize: function(size){
                $('.select-size-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-size-collapsible span.ui-btn-text').text(size.name);
                Mist.machineAddController.set('newMachineSize', size);  
                           
                Mist.machineAddController.set('newMachineLocation', null);
                $('.select-location-collapsible span.ui-btn-text').text('Select Location');                     
                $('.select-size-collapsible').trigger('collapse');
                return false;               
            },

            selectLocation: function(location){
                $('.select-location-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-location-collapsible span.ui-btn-text').text(location.name);
                Mist.machineAddController.set('newMachineLocation', location);      
                $('.select-location-collapsible').trigger('collapse');
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
                Mist.machineAddController.newMachine();
                $('.dialog-add').panel('close');
                Mist.Router.router.transitionTo('machines');
                this.clear();
            },

            backClicked: function() {
                this.clear();
                $('.dialog-add').panel('close');
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_add_dialog_html));
                
                var that = this;
                
                Ember.run.next(function(){
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

                                $('#create-machine-script').textinput('enable');                                
                            } else {
                                $('.select-key-collapsible').addClass('ui-disabled');

                                $('#create-machine-script').textinput('enable');                                                                
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
