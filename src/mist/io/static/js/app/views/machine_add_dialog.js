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
                log('clear');
                Mist.machineAddController.newMachineClear();
            },

            didInsertElement: function() {
                var that = this;

                // FIXME better to bind this straight in the template but it
                // does not seem to work
                this.$().bind('pagebeforeshow', function(e, data){
                    if(data.prevPage[0].id){
                        that.clear.apply(that);
                    }
                });
            },

            newMachineClicked: function(){
                //FIXME there should be a way to bind the action directly to the controller
                Mist.machineAddController.newMachine();
                history.back();
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
                            try {
                                $('#create-select-provider').selectmenu('refresh');
                                $('#create-select-image').selectmenu('refresh');
                                $('#create-select-size').selectmenu('refresh');
                                $('#create-select-location').selectmenu('refresh');
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function() {
                            try {
                                if (value) {
                                    $('#create-ok').button('enable');
                                } else {
                                    $('#create-ok').button('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineNameReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#create-select-provider').selectmenu('enable');
                                    $('#create-select-image').selectmenu('disable');
                                    $('#create-select-size').selectmenu('disable');
                                    $('#create-select-location').selectmenu('disable');
                                } else {
                                    $('#create-select-provider').selectmenu('disable');
                                    $('#create-select-image').selectmenu('disable');
                                    $('#create-select-size').selectmenu('disable');
                                    $('#create-select-location').selectmenu('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineBackendReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#create-select-image').selectmenu('enable');
                                    $('#create-select-size').selectmenu('disable');
                                    $('#create-select-location').selectmenu('disable');
                                } else {
                                    $('#create-select-image').selectmenu('disable');
                                    $('#create-select-size').selectmenu('disable');
                                    $('#create-select-location').selectmenu('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineImageReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#create-select-size').selectmenu('enable');
                                    $('#create-select-location').selectmenu('disable');
                                } else {
                                    $('#create-select-size').selectmenu('disable');
                                    $('#create-select-location').selectmenu('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineSizeReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#create-select-location').selectmenu('enable');
                                } else {
                                    $('#create-select-location').selectmenu('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineLocationReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#create-ok').button('enable');
                                } else {
                                    $('#create-ok').button('disable');
                                }
                            } catch (e){

                            }
                        });
                    });
                });
            },
        });
    }
);
