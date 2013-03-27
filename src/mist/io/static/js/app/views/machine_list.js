define('app/views/machine_list', [
    'app/views/mistscreen',
    'text!app/templates/machine_list.html',
    'ember'
    ],
/**
 *
 * Machine page
 *
 * @returns Class
 */
function(MistScreen, machine_list_html) {
    return MistScreen.extend({

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
        
        addMachine: function(){
            $("#dialog-add").popup("open", {transition: 'pop'});
        },

        template: Ember.Handlebars.compile(machine_list_html),
        
        openTags: function(){
            $("#dialog-tags").popup("open", {transition: 'pop'});
        },
        
        openShell: function(){
            $("#dialog-shell").popup("open", {transition: 'pop'});
        },

        openActions: function(){
            $("#dialog-power").popup("open", {transition: 'pop'});
        }
    });
});
