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
            },

            init: function() {
                this._super();
                this.set('template', Ember.Handlebars.compile(machine_add_dialog_html));

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
                                $('.select-image-collapsible').addClass('ui-disabled');
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
                            $('#dialog-add .ui-collapsible ul').listview('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineSizeReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineSizeReady) {
                                $('.select-image-collapsible').removeClass('ui-disabled');
                                $('.select-location-collapsible').addClass('ui-disabled');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-image-collapsible').addClass('ui-disabled');
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
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('disable');
                            } else {
                                $('.select-location-collapsible').addClass('ui-disabled');
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
                                $('#create-machine-script').textinput('enable');                                
                                $('#create-machine-ok').button('enable');
                            } else {
                                $('#create-machine-ok').button('disable');
                                $('.select-key-collapsible').addClass('ui-disabled');
                                $('#create-machine-script').textinput('enable');                                                                
                            }
                        });
                    });
                });
            },
        });
    }
);
