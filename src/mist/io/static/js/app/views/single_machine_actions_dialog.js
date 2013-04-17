define('app/views/single_machine_actions_dialog', [
    'text!app/templates/single_machine_actions_dialog.html',
    'ember'
    ],
    /**
     *
     * Machine page
     *
     * @returns Class
     */
    function(single_machine_actions_dialog_html) {
        return Ember.View.extend({

            reboot: function(){
            	var machine = this.get('controller').get('model');
            	$("#dialog-single-power" ).on( "popupafterclose", function( event, ui ) {
                    Mist.confirmationController.set("title", 'Reboot Machine');
                    Mist.confirmationController.set("text", 'Are you sure you want to reboot ' +
                            machine.name +' ?');
                    Mist.confirmationController.set("callback", function(){
                        machine.reboot();
                        Mist.Router.router.transitionTo('machines');
                    });
                    Mist.confirmationController.set("fromDialog", true);
                    Mist.confirmationController.show();

                    $("#dialog-single-power" ).off("popupafterclose");
                    
            	});
            	$('#dialog-single-power').popup('close');
            },

            destroy: function(){
            	var machine = this.get('controller').get('model');
            	$("#dialog-single-power" ).on( "popupafterclose", function( event, ui ) {
                    Mist.confirmationController.set("title", 'Destroy Machine');
                    Mist.confirmationController.set("text", 'Are you sure you want to destroy ' +
                            machine.name +' ?');
                    Mist.confirmationController.set("callback", function(){
                        machine.destroy();
                        window.history.go(-1);
                    });
                    Mist.confirmationController.set("fromDialog", true);
                    Mist.confirmationController.show();

                    $("#dialog-single-power" ).off("popupafterclose");
                });
                try{
                    $('#dialog-single-power').popup('close');                    
                } catch(err){}
            },

            shutdown: function(){
            	var machine = this.get('controller').get('model');
            	$("#dialog-single-power" ).on( "popupafterclose", function( event, ui ) {
                    Mist.confirmationController.set("title", 'Shutdown Machine');
                    Mist.confirmationController.set("text", 'Are you sure you want to shutdown ' +
                            machine.name +' ?');
                    Mist.confirmationController.set("callback", function(){
                        machine.shutdown();
                    });
                    Mist.confirmationController.set("fromDialog", true);
                    Mist.confirmationController.show();

                    $("#dialog-single-power" ).off("popupafterclose");
                });
            	$('#dialog-single-power').popup('close');
            },

            start: function(){
            	var machine = this.get('controller').get('model');
                machine.start();
            	$('#dialog-single-power').popup('close');
            },

            template: Ember.Handlebars.compile(single_machine_actions_dialog_html),
        });
    }
);
