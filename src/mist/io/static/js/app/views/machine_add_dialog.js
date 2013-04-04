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

                $(document).on("pageshow", '#dialog-add', function (event) {
                        $('input#create-machine-name').focus();
                    }
                );

                Ember.run.next(function(){
                    Mist.machineAddController.addObserver('newMachineBackend', function() {
                        Ember.run.next(function() {
                            $('#dialog-add select').selectmenu('refresh');
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
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineNameReady) {
                                $('#createmachine-select-provider').selectmenu('enable');
                                $('#createmachine-select-image').selectmenu('disable');
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                                $('#createmachine-select-script').selectmenu('disable');
                            } else {
                                $('#createmachine-select-provider').selectmenu('disable');
                                $('#createmachine-select-image').selectmenu('disable');
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                                $('#createmachine-select-script').selectmenu('disable');
                            }
                            $('#dialog-add select').selectmenu('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineBackendReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineBackendReady) {
                                $('#createmachine-select-image').selectmenu('enable');
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                                $('#createmachine-select-script').selectmenu('disable');
                            } else {
                                $('#createmachine-select-image').selectmenu('disable');
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                                $('#createmachine-select-script').selectmenu('disable');
                            }
                            $('#dialog-add select').selectmenu('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineImageReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineImageReady) {
                                $('#createmachine-select-size').selectmenu('enable');
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                                $('#createmachine-select-script').selectmenu('disable');
                            } else {
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                                $('#createmachine-select-script').selectmenu('disable');
                            }
                            $('#dialog-add select').selectmenu('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineSizeReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineSizeReady) {
                                $('#createmachine-select-location').selectmenu('enable');
                                $('#createmachine-select-key').selectmenu('disable');
                            } else {
                                $('#createmachine-select-location').selectmenu('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                            }
                            $('#dialog-add select').selectmenu('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineLocationReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineLocationReady) {
                                $('#create-machine-ok').button('enable');
                                $('#createmachine-select-key').selectmenu('enable');
                            } else {
                                $('#create-machine-ok').button('disable');
                                $('#createmachine-select-key').selectmenu('disable');
                            }
                        });
                    });
                });
            },
        });
    }
);
