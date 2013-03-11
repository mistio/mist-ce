define('app/views/machine_list', [
    'app/views/jqm_page',
    'text!app/templates/machine_list.html',
    'ember'
    ],
/**
 *
 * Machine page
 *
 * @returns Class
 */
function(Page, machine_list_html) {
    return Page.extend({

        disabledShellClass : function() {
            var machines = new Array();

            if (Mist.backendsController.selectedMachineCount > 1) {
                return 'ui-disabled';
            }

            Mist.backendsController.forEach(function(backend) {
                backend.machines.forEach(function(machine) {
                    if (machine.selected && machine.hasKey && machine.state == 'running') {
                        machines.push(machine);
                    }
                });
            });

            if (machines.length == 1) {
                return '';
            } else {
                return 'ui-disabled';
            }
        }.property('Mist.backendsController.selectedMachineCount'),

        disabledTagClass : function() {
            var machines = new Array();

            if (Mist.backendsController.selectedMachineCount > 1) {
                return 'ui-disabled';
            }

            Mist.backendsController.forEach(function(backend) {
                backend.machines.forEach(function(machine) {
                    if (machine.selected && machine.can_tag) {
                        machines.push(machine);
                    }
                });
            });

            if (machines.length == 1) {
                return '';
            } else {
                return 'ui-disabled';
            }
        }.property('Mist.backendsController.selectedMachineCount'),

        disabledPowerClass : function() {
            var machines = new Array();

            Mist.backendsController.forEach(function(backend) {
                backend.machines.forEach(function(machine) {
                    if (machine.selected && machine.state === 'terminated') {
                        machines.push(machine);
                    }
                });
            });

            if (machines.length >= 1) {
                // even if one machine is in the above states, no action is allowed
                return 'ui-disabled';
            } else {
                return '';
            }
        }.property('Mist.backendsController.selectedMachineCount'),

        id: 'machines',
        
        init : function() {
            this._super();
            this.set('template', Ember.Handlebars.compile(machine_list_html));
        },
    });
});
