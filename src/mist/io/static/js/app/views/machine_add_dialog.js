define('app/views/machine_add_dialog', [
    'text!app/templates/machine_add_dialog.html','ember'],
    /**
     *
     * Machine Add Dialog page
     *
     * @returns Class
     */
    function(machine_add_dialog_html) {
        return Ember.View.extend({
            tagName: false,

            clear: function(){
                Mist.machineAddController.newMachineClear();
                $('#dialog-add select').selectmenu();
                $('#dialog-add select').selectmenu('disable');
                $('#create-ok').button();
                $('#create-ok').button('disable');
            },

            didInsertElement: function() {
                var that = this;

                this.$().bind('popupbeforeposition', function(e, data){
                    that.clear();
                });
            },

            newMachineClicked: function(){
                //FIXME there should be a way to bind the action directly to the controller
                Mist.machineAddController.newMachine();
                $.mobile.changePage('#machines');
            },

            backClicked: function(){
                history.back();
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(machine_add_dialog_html));

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
                                $('#create-ok').button('enable');
                            } else {
                                $('#create-ok').button('disable');
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
                            } else {
                                $('#createmachine-select-provider').selectmenu('disable');
                                $('#createmachine-select-image').selectmenu('disable');
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
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
                            } else {
                                $('#createmachine-select-image').selectmenu('disable');
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
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
                            } else {
                                $('#createmachine-select-size').selectmenu('disable');
                                $('#createmachine-select-location').selectmenu('disable');
                            }
                            $('#dialog-add select').selectmenu('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineSizeReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineSizeReady) {
                                $('#createmachine-select-location').selectmenu('enable');
                            } else {
                                $('#createmachine-select-location').selectmenu('disable');
                            }
                            $('#dialog-add select').selectmenu('refresh');
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineLocationReady', function() {
                        Ember.run.next(function(){
                            $('#dialog-add select').selectmenu();
                            if (Mist.machineAddController.newMachineLocationReady) {
                                $('#create-ok').button('enable');
                            } else {
                                $('#create-ok').button('disable');
                            }
                        });
                    });
                });
            },
        });
    }
);
