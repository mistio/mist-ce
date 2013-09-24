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
        tagName:false,

        template: Ember.Handlebars.compile(machine_list_html),

        disabledShellClass : function() {
            var machines = new Array();

            if (Mist.backendsController.selectedMachineCount > 1) {
                return 'ui-disabled';
            }

            Mist.backendsController.forEach(function(backend) {
                backend.machines.forEach(function(machine) {
                    if (machine.selected && machine.probed && machine.state == 'running') {
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

        openTags: function(){
            $("#dialog-tags").popup('option', 'positionTo', '#machines-button-tags').popup('open', {transition: 'slideup'});
        },

        openShell: function(){
            $("#dialog-shell").popup('option', 'positionTo', '#machines-button-shell')
                              .popup('open', {transition: 'slideup'});
            $("#dialog-shell").on('popupafterclose', 
                    function(){
                        $(window).off('resize');
                    }
            );
            
            Ember.run.next(function(){
                $(window).on('resize', function(){
                    $('#dialog-shell-popup').css({'left':'5%','width':'90%'});
                    $('.shell-return').css({'height': (0.6*$(window).height()) + 'px'});
                    $('.shell-input input').focus();
                    return false;
                });
                $(window).trigger('resize');     
            });             
        },

        openActions: function(){
            $("#dialog-power").popup('option', 'positionTo', '#machines-button-power').popup('open', {transition: 'slideup'});
        },

        selectMachines: function(event) {
            var selection = $(event.target).attr('title');

            if(selection == 'none'){
                Mist.backendsController.forEach(function(backend){
                    backend.machines.forEach(function(machine){
                        log('deselecting machine: ' + machine.name);
                        machine.set('selected', false);
                    });
                });
            } else if(selection == 'all'){
                Mist.backendsController.forEach(function(backend){
                    backend.machines.forEach(function(machine){
                        log('selecting machine: ' + machine.name);
                        machine.set('selected', true);
                    });
                });
            } else {
                Mist.backendsController.forEach(function(backend){
                    if(backend.provider == selection){
                        backend.machines.forEach(function(machine){
                            log('selecting machine: ' + machine.name);
                            machine.set('selected', true);
                        });
                    } else {
                        backend.machines.forEach(function(machine){
                            log('deselecting machine: ' + machine.name);
                            machine.set('selected', false);
                        });
                    }
                });
            }
            Ember.run.next(function(){
                $("input[type='checkbox']").checkboxradio("refresh");
            });
            $("#select-machines-listmenu li a").off('click', this.selectMachines);
            $('#select-machines-popup').popup('close');
            return false;
        },

        openMachineSelectPopup: function() {
            $('#select-machines-listmenu').listview('refresh');
            $('#select-machines-popup').popup('option', 'positionTo', '.select-machines').popup('open', {transition: 'pop'});
            $("#select-machines-listmenu li a").on('click', this.selectMachines);
        }
    });
});
