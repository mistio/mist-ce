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
                $('.select-listmenu').listview('refresh');
                $('#dialog-add').panel('open');
                $('.select-provider-collapsible ul li').on( "click", this.selectProvider);
                $('.select-image-collapsible ul li').on( "click", this.selectImage);
                $('.select-key-collapsible ul li').on( "click", this.selectKey);                
            },
            
            selectProvider: function(event){
                $('.select-provider-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-provider-collapsible span.ui-btn-text').text(event.target.text);
                Mist.machineAddController.set('newMachineBackend', Mist.backendsController.getBackendById($(event.target).attr('title')));        
                $('.select-provider-collapsible').trigger('collapse');
                return false;               
            },
            
            selectSize: function(event){
                $('.select-size-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-size-collapsible span.ui-btn-text').text(event.target.text);
                Mist.machineAddController.set('newMachineSize', $(event.target).attr('title'));        
                $('.select-size-collapsible').trigger('collapse');
                return false;               
            },
                       
            selectImage: function(event){
                $('.select-image-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-image-collapsible span.ui-btn-text').text(event.target.text);
                Mist.machineAddController.set('newMachineImage', $(event.target).attr('title'));        
                $('.select-image-collapsible').trigger('collapse');
                return false;               
            },

            selectLocation: function(event){
                $('.select-location-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-location-collapsible span.ui-btn-text').text(event.target.text);
                Mist.machineAddController.set('newMachineLocation', $(event.target).attr('title'));        
                $('.select-location-collapsible').trigger('collapse');
                return false;               
            },
                        
            selectKey: function(event){
                $('.select-key-collapsible').collapsible('option','collapsedIcon','check');
                $('.select-key-collapsible span.ui-btn-text').text(event.target.text);
                Mist.machineAddController.set('newMachineKey', $(event.target).attr('title'));        
                $('.select-key-collapsible').trigger('collapse');
                return false;               
            },
                            
            clear: function(){
                Mist.machineAddController.newMachineClear();
                $('#create-machine-name').val('');
                $('#dialog-add').find('select.create-select').children('option').removeAttr('selected');
                $('#dialog-add').find('select.create-select').find('option:first').attr('selected','selected');
                $('#dialog-add').find('select.create-select').selectmenu('refresh');
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
                $('#dialog-add').panel('close');
                this.clear();
            },

            backClicked: function() {
                this.clear();
                $('#dialog-add').panel('close');
                $('.select-provider-collapsible ul li').off( "click", this.selectProvider);
                $('.select-size-collapsible ul li').off( "click", this.selectSize);
                $('.select-image-collapsible ul li').off( "click", this.selectImage);
                $('.select-key-collapsible ul li').off( "click", this.selectKey);
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_add_dialog_html));
                
                var that = this;
                
                Ember.run.next(function(){
                    Mist.machineAddController.addObserver('newMachineBackend', function() {
                        Ember.run.next(function() {
                            $('#dialog-add .ui-collapsible ul').listview('refresh');
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
                            //$('#dialog-add select').selectmenu();
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
                            $('#dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineBackendReady', function() {       
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineBackendReady) {
                                $('.select-size-collapsible').removeClass('ui-disabled');
                                $('.select-size-collapsible ul li').on( "click", that.selectSize);

                                $('.select-image-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-image-collapsible').addClass('ui-disabled');
                                $('.select-size-collapsible ul li').off( "click", that.selectSize);

                                $('.select-size-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('#dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineSizeReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineSizeReady) {
                                $('.select-image-collapsible').removeClass('ui-disabled');
                                $('.select-image-collapsible ul li').on( "click", that.selectImage);

                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-image-collapsible').addClass('ui-disabled');
                                $('.select-image-collapsible ul li').off( "click", that.selectImage);

                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('#dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });
                    
                    Mist.machineAddController.addObserver('newMachineImageReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineImageReady) {
                                $('.select-location-collapsible').removeClass('ui-disabled');
                                $('.select-location-collapsible ul li').on( "click", that.selectLocation);

                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-location-collapsible ul li').on( "click", that.selectLocation);

                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            }
                            $('#dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineLocationReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineLocationReady) {
                                $('.select-key-collapsible').removeClass('ui-disabled');
                                $('.select-key-collapsible ul li').on( "click", that.selectKey);

                                $('#create-machine-script').textinput('enable');                                
                                $('#create-machine-ok').button('enable');
                            } else {
                                $('#create-machine-ok').button('disable');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible ul li').off( "click", that.selectKey);

                                $('#create-machine-script').textinput('enable');                                                                
                            }
                        });
                    });
                });
            },
        });
    }
);
