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
                            //try {
                                $('#createmachine-select-provider').selectmenu('refresh');
                            //} catch (e) {
                            //	console.error(e);
                            //}
                            //try{
                                $('#createmachine-select-image').selectmenu('refresh');
                            //} catch (e) {
                            //	console.error(e);
                            //}
                            //try {
                                $('#createmachine-select-size').selectmenu('refresh');
                            //} catch (e) {
                            //	console.error(e);
                            //}
                            //try {
                                $('#createmachine-select-location').selectmenu('refresh');
                            //} catch (e) {
                            //	console.error(e);
                            //}
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function() {
                            //try {
                                if (value) {
                                    $('#create-ok').button('enable');
                                } else {
                                    $('#create-ok').button('disable');
                                }
                            //} catch (e) {

                            //}
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineNameReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            //try {
                                if (value) {
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
                            //} catch (e) {
                            //	console.error(e);
                            //}
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineBackendReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#createmachine-select-image').selectmenu('enable');
                                    $('#createmachine-select-size').selectmenu('disable');
                                    $('#createmachine-select-location').selectmenu('disable');
                                } else {
                                    $('#createmachine-select-image').selectmenu('disable');
                                    $('#createmachine-select-size').selectmenu('disable');
                                    $('#createmachine-select-location').selectmenu('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineImageReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#createmachine-select-size').selectmenu('enable');
                                    $('#createmachine-select-location').selectmenu('disable');
                                } else {
                                    $('#createmachine-select-size').selectmenu('disable');
                                    $('#createmachine-select-location').selectmenu('disable');
                                }
                            } catch (e) {

                            }
                        });
                    });

                    Mist.machineAddController.addObserver('newMachineSizeReady', function(sender, machineReady, value, rev) {
                        Ember.run.next(function(){
                            try {
                                if (value) {
                                    $('#createmachine-select-location').selectmenu('enable');
                                } else {
                                    $('#createmachine-select-location').selectmenu('disable');
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
