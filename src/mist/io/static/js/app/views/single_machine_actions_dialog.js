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
            tagName: false,
            machineBinding: 'Mist.machine',

            reboot: function(){
                var machine = this.machine;
                Mist.confirmationController.set("title", 'Reboot Machine');
                Mist.confirmationController.set("text", 'Are you sure you want to reboot ' +
                        machine.name +' ?');
                Mist.confirmationController.set("callback", function(){
                    machine.reboot();
                    window.history.go(-1);
                });
                Mist.confirmationController.set("fromDialog", true);
                Mist.confirmationController.show();
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
