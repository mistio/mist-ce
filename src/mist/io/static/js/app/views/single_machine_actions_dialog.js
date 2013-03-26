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
                    Mist.Router.router.transitionTo('keys');
                });
                Mist.confirmationController.set("fromDialog", true);
                Mist.confirmationController.show();
                
                //TODO remove event handler now
                
        	});
        	
        	$('#dialog-single-power').popup('close');
        	
            },

            destroy: function(){
                var machine = this.machine;
                Mist.confirmationController.set("title", 'Destroy Machine');
                Mist.confirmationController.set("text", 'Are you sure you want to destroy ' +
                        machine.name +' ?');
                Mist.confirmationController.set("callback", function(){
                    machine.destroy();
                    window.history.go(-1);
                });
                Mist.confirmationController.set("fromDialog", true);
                Mist.confirmationController.show();
            },

            shutdown: function(){
                var machine = this.machine;
                Mist.confirmationController.set("title", 'Shutdown Machine');
                Mist.confirmationController.set("text", 'Are you sure you want to shutdown ' +
                        machine.name +' ?');
                Mist.confirmationController.set("callback", function(){
                    machine.shutdown();
                    window.history.go(-1);
                });
                Mist.confirmationController.set("fromDialog", true);
                Mist.confirmationController.show();
            },

            start: function(){
                this.machine.start();
            },

            init: function() {
                this._super();
                // cannot have template in home.pt as pt complains
                this.set('template', Ember.Handlebars.compile(single_machine_actions_dialog_html));
            },
        });
    }
);
